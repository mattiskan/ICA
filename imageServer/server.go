package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

var scores = make(map[string]int)

type info struct {
	url   string
	name  string
	votes int
}

var baseURL = "http://192.168.0.150:8080/uploads"

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
	// os.Chdir("uploads")
	os.MkdirAll("uploads/"+contestId, 0777)
	// os.Chdir(contestId)
	err = ioutil.WriteFile("uploads/"+contestId+"/"+handler.Filename, data, 0777)
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
	//os.Chdir("uploads")

	files, _ := ioutil.ReadDir("./uploads/")
	fmt.Fprintf(w, "[")
	var before = false
	for _, f := range files {
		if f.Name()[0] != '.' {
			// fmt.Fprintf(w, "%s\n", f.Name())
			if before {
				fmt.Fprintf(w, ", ")
			}
			log.Println(f.Name())
			fmt.Fprintf(w, "%s", f.Name())
			before = true
		}
	}
	fmt.Fprintf(w, "]")
}

func getImages(w http.ResponseWriter, r *http.Request) {
	//os.Chdir("uploads")
	var str = r.FormValue("contest")
	//os.Chdir(str)
	files, _ := ioutil.ReadDir("./uploads/" + str + "/")
	fmt.Fprintf(w, "[")
	var before = false
	for _, f := range files {
		if f.Name()[0] != '.' {
			// log.Println(f.Name())
			// fmt.Fprintf(w, "%s\n", f.Name())
			if before {
				fmt.Fprintf(w, ",")
			}
			fmt.Fprintf(w, "{")
			fmt.Fprintf(w, "\"url\": \"%s/%s/%s\"", baseURL, str, f.Name())
			fmt.Fprintf(w, ", \"title\": \"%s\"", f.Name())
			fmt.Fprintf(w, ", \"votes\": \"%d\"}", scores[str+"/"+f.Name()])
			before = true
		}
	}
	fmt.Fprintf(w, "]")
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
