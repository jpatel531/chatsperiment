package main

import (
	"encoding/json"
	"fmt"
	"github.com/codegangsta/martini-contrib/render"
	r "github.com/dancannon/gorethink"
	"github.com/go-martini/martini"
	phttpp "github.com/pusher/pusher-http-go"
	pwsp "github.com/pusher/pusher-websocket-go"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	// "time"
)

var phttp, pusherErr = phttpp.ClientFromEnv("CHAT_URL")
var pws = pwsp.New("57c062d9ae3d0e36c417")
var messageChannel *pwsp.Channel

var session, dbErr = r.Connect(r.ConnectOpts{
	Address:  "localhost:28015",
	Database: "chat",
})

func handleGetRoot(ren render.Render) {
	ren.HTML(200, "index", nil)
}

type Message struct {
	Name string `gorethink:"name" json:"name"`
	Body string `gorethink:"body" json:"body"`
}

func listenForEvents() {
	messageChannel.Bind("client-push", func(data interface{}) {
		params, _ := data.(string)

		var message Message
		log.Printf("Received chat message: %s", data)
		json.Unmarshal([]byte(params), &message)

		log.Println(message)

		_, err := r.Table("messages").Insert(message).RunWrite(session)
		if err != nil {
			panic(err)
		}
	})

	messageChannel.Bind("client-sync-request", func(data interface{}) {

		idData, _ := data.(string)

		var idMap map[string]string

		json.Unmarshal([]byte(idData), &idMap)

		var messages []Message
		res, _ := r.Table("messages").Run(session)
		res.All(&messages)
		// messageChannel.Trigger("client-sync-response", "hello")
		phttp.Trigger("private-"+idMap["id"], "sync-response", messages)
	})

}

func pusherAuth(ren render.Render, res http.ResponseWriter, req *http.Request) {
	params, _ := ioutil.ReadAll(req.Body)
	response, err := phttp.AuthenticatePrivateChannel(params)
	if err != nil {
		panic(err)
	}
	fmt.Fprintf(res, string(response))
}

func handleGetMessages(ren render.Render) {
	var messages []Message
	res, _ := r.Table("messages").Run(session)
	res.All(&messages)
	ren.JSON(200, messages)
}

func main() {

	if pusherErr != nil {
		panic(pusherErr)
	}

	if dbErr != nil {
		panic(dbErr)
	}

	pws.ClientConfig.Secret = os.Getenv("CHAT_SECRET")
	messageChannel = pws.Subscribe("private-messages")

	// timer := time.NewTimer(time.Second * 4)

	// <-timer.C

	// messageChannel.Trigger("client-test", "hello")

	m := martini.Classic()

	renderOptions := render.Options{
		Directory:  "public/templates",
		Extensions: []string{".tmpl", ".html"},
	}

	m.Use(render.Renderer(renderOptions))
	m.Get("/", handleGetRoot)
	m.Get("/messages", handleGetMessages)
	m.Post("/pusher/auth", pusherAuth)

	listenForEvents()

	m.Run()
}
