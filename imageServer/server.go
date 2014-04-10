package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var scores = make(map[string]int)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
	r.ParseMultipartForm(6400000)

	log.Printf("%v", r)
	log.Printf("Contest: %v", r.FormValue("contest"))

	var contestId = r.FormValue("contest")

	file, handler, err := r.FormFile("file")
	if err != nil {
		fmt.Println(err)
	}
	data, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println(err)
	}
	os.MkdirAll("uploads", 0777)
	os.Chdir("uploads")
	os.MkdirAll(contestId, 0777)
	os.Chdir(contestId)
	err = ioutil.WriteFile(handler.Filename, data, 0777)
	if err != nil {
		fmt.Println(err)
	}
}
func inc(w http.ResponseWriter, r *http.Request) {
	var str = r.FormValue("contest") + "/" + r.FormValue("image")
	scores[str] = scores[str] + 1
	log.Printf("%v: %d", str, scores[str])
	fmt.Fprintf(w, "%d", scores[str])
}

func get(w http.ResponseWriter, r *http.Request) {
	var str = r.FormValue("contest") + "/" + r.FormValue("image")
	log.Printf("%v: %d", str, scores[str])
	fmt.Fprintf(w, "%d", scores[str])
}

func getContests(w http.ResponseWriter, r *http.Request) {
	os.Chdir("uploads")

	files, _ := ioutil.ReadDir("./")
	for _, f := range files {
		if f.Name()[0] != '.' {
			log.Println(f.Name())
			fmt.Fprintf(w, "%s\n", f.Name())
		}
	}
}

func getImages(w http.ResponseWriter, r *http.Request) {
	os.Chdir("uploads")
	var str = r.FormValue("contest")
	os.Chdir(str)
	files, _ := ioutil.ReadDir("./")
	for _, f := range files {
		if f.Name()[0] != '.' {
			log.Println(f.Name())
			fmt.Fprintf(w, "%s\n", f.Name())
		}
	}
}

func main() {
	http.HandleFunc("/upload", handler)
	http.HandleFunc("/inc", inc)
	http.HandleFunc("/get", get)
	http.HandleFunc("/getContests", getContests)
	http.HandleFunc("/getImages", getImages)
	// http.HandleFunc("/uploads/:room/", func(w http.ResponseWriter, r *http.Request) {
	// 	log.Printf("Path: %v\n", r.URL.Path[1:])
	// 	// http.ServeFile(w, r, r.URL.Path[1:])
	// })
	http.Handle("/", http.FileServer(http.Dir("./")))
	http.ListenAndServe(":8080", nil)
}
