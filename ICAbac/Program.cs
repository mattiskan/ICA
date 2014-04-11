using HtmlAgilityPack;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Runtime.Serialization;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace ICAbac
{
    class Program
    {
        [DataContract]
        class FoodNode
        {
            [DataMember]
            public string Ingredient;
            [DataMember]
            public Dictionary<string, int> Weights = new Dictionary<string, int>();

            public FoodNode(string ingredient)
            {
                Ingredient = ingredient;
            }

            public void AddNeighbour(string other)
            {
                if (!Weights.ContainsKey(other))
                    Weights.Add(other, 1);
                else
                    ++Weights[other];
            }

            public int GetWeight(string other)
            {
                int weight;
                return (Weights.TryGetValue(other, out weight)) ? weight : 0;
            }
        }

        private const string DbFileName = "foodNodeDB.dat";
        private NetDataContractSerializer DbSerializer = new NetDataContractSerializer();
        private Dictionary<string, FoodNode> Db;
        private List<string> Ingredients;

        void run(string[] args)
        {
            //File.WriteAllText("trace.txt", "");
            //Trace.Listeners.Add(new TextWriterTraceListener("trace.txt"));
            Trace.Listeners.Add(new ConsoleTraceListener(true));

            if (args.Length == 0)
                usage();
            else if (args[0] == "--interactive" && args.Length == 1)
                interactive();
            else if (args[0] == "--server" && args.Length == 2)
                server(args[1]);
            else if (args[0] == "--crawl" && args.Length == 1)
                crawl();
            else
                usage();
        }

        private void usage()
        {
            Console.WriteLine(@"Usage:

    ICAbac --crawl
    ICAbac --interactive
    ICAbac --server http://*:PORT/PATH/");
        }

        void saveDb()
        {
            var dbFile = File.Create(DbFileName);
            DbSerializer.Serialize(dbFile, Db);
            dbFile.Close();
        }

        void loadDb()
        {
            Db = (Dictionary<string, FoodNode>)DbSerializer.ReadObject(File.OpenRead(DbFileName));
            Ingredients = Db.Keys.ToList();
        }

        void interactive()
        {
            loadDb();

            while (true)
            {
                Console.Write("How many ingredients? ");
                int ingredientCount;
                while (!int.TryParse(Console.ReadLine(), out ingredientCount) || ingredientCount <= 0)
                    ;
                Console.WriteLine();

                HashSet<string> bestSet = createIngredientSet(ingredientCount);
                Console.WriteLine(string.Join(", ", bestSet));
                Console.WriteLine();
            }
        }

        void server(string prefix)
        {
            loadDb();

            HttpListener listener = new HttpListener();
            listener.Prefixes.Add(prefix);
            Trace.WriteLine("Starting listener");
            try
            {
                listener.Start();
            }
            catch (Exception e)
            {
                Trace.WriteLine(e.ToString());
                Trace.WriteLine("Running as admin?");
                Environment.Exit(1);
            }

            while (true)
            {
                HashSet<string> set = createIngredientSet(7);
                var obj = new { ingredients = set.ToArray() };
                string json = JsonConvert.SerializeObject(obj);
                byte[] buffer = Encoding.UTF8.GetBytes(json);

                Trace.WriteLine("Waiting for request...");
                var context = listener.GetContext();
                Trace.WriteLine("Handling request");
                var response = context.Response;
                response.AddHeader("Access-Control-Allow-Origin", "*");
                response.ContentLength64 = buffer.LongLength;
                response.ContentType = "application/json; charset=utf-8";
                var output = response.OutputStream;
                output.Write(buffer, 0, buffer.Length);
                output.Close();
            }
        }

        HashSet<string> createIngredientSet(int ingredientCount)
        {
            HashSet<string> bestSet = new HashSet<string>();
            int bestScore = int.MaxValue;
            DateTime deadline = DateTime.Now + TimeSpan.FromSeconds(1);
            Random random = new Random();
            while (DateTime.Now < deadline)
            {
                HashSet<string> set = new HashSet<string>();
                for (int i = 0; i < ingredientCount; ++i)
                {
                    string other;
                    do
                    {
                        other = Ingredients[random.Next() % Ingredients.Count];
                    } while (set.Contains(other));
                    set.Add(other);
                }
                int score = set.Sum(ingredient => set.Sum(other => Db[ingredient].GetWeight(other)));
                if (score < bestScore)
                {
                    bestSet = set;
                    bestScore = score;
                }
            }
            return bestSet;
        }

        void crawl()
        {
            Db = new Dictionary<string, FoodNode>();

            for (int i = 1; ; ++i)
            {
                Trace.WriteLine("Crawling page " + i);
                string page = get("http://www.recept.nu/typ-av-ratt/varmratt?page={pageNum}".With(pageNum => i));
                File.WriteAllText("page.html", page);

                HtmlDocument pageDoc = new HtmlDocument();
                pageDoc.LoadHtml(page);

                var ingredientLists = pageDoc.DocumentNode.Descendants("div")
                    .Where(div => div.GetAttributeValue("class", null) == "recipie-list__back");

                foreach (var ingredientList in ingredientLists)
                {
                    var ingredients = ingredientList.Descendants("span")
                        .Where(span => span.GetAttributeValue("class", null) == "ingredient")
                        .Select(span => span.NextSibling.NextSibling.InnerText)
                        .Select(text => text.Trim().Replace("&nbsp;", ""))
                        .Select(text => filterIngredient(text))
                        .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient));

                    Trace.WriteLine(string.Join(", ", ingredients));
                    Trace.WriteLine("");

                    foreach (var ingredient in ingredients)
                    {
                        FoodNode fn = null;
                        if (!Db.TryGetValue(ingredient, out fn))
                            Db.Add(ingredient, fn = new FoodNode(ingredient));

                        foreach (var other in ingredients.Where(o => o != ingredient))
                            fn.AddNeighbour(other);
                    }
                }

                Trace.WriteLine("Saving data");
                saveDb();

                //Environment.Exit(0);
                //break;
                Trace.WriteLine("Sleeping...");
                Thread.Sleep(5000);
            }
        }

        readonly string[] badWords = new[]
            {
                "torkad", "rivet", "riven", "skal", "saft", "och", "av", "mjölig", "eller", "ca", "g", "st",
                "i", "på", "skuren", "färsk", "rökt", "till", "stekning", "samma", "som", "till", "hackad",
                "små", "röda", "torkade", "flytande", "färskriven", "stark", "stor", "liten",
                "salt", "stora", "att", "steka", "annan", "kort", "extra", "jungfru", "pannan", "gärna",
                "burk", "på", "finhackad", "krossade", "finhackade", "per", "person", "aluminiumfolie",
                "grovt", "hackade", "med", "kokta",
            };

        string filterIngredient(string ingredient)
        {
            ingredient = ingredient.ToLowerInvariant();

            char[] ca = ingredient.ToCharArray();
            for (int i = 0; i < ingredient.Length; ++i)
            {
                char c = ca[i];
                if (!(char.IsLetter(c) || c == ' '))
                    ca[i] = ' ';
            }
            ingredient = new string(ca);

            ingredient = " " + ingredient + " ";
            foreach (var badWord in badWords)
                ingredient = ingredient.Replace(" " + badWord + " ", " ");

            ingredient = Regex.Replace(ingredient, @"\s\s+", " ");
            ingredient = ingredient.Trim();

            return ingredient;
        }

        string get(string url)
        {
            var request = HttpWebRequest.Create(url) as HttpWebRequest;
            if (request == null)
                return null;
            var response = request.GetResponse();
            if (response == null)
                return null;
            var stream = response.GetResponseStream();
            string data = new StreamReader(stream).ReadToEnd();
            return data;
        }

        static void Main(string[] args)
        {
            new Program().run(args);
        }
    }

    public static class StringExtensions
    {
        static StringExtensions()
        {
            Thread.CurrentThread.CurrentCulture = CultureInfo.InvariantCulture;
        }

        public static string With(this string format, params object[] args)
        {
            return String.Format(format, args);
        }

        public static string With(this string format, params Expression<Func<string, object>>[] expressions)
        {
            Dictionary<string, object> formatpairs = expressions.
                ToDictionary(e => "{" + e.Parameters[0].Name + "}", e => e.Compile()(null));
            var s = new StringBuilder(format);
            foreach (var kv in formatpairs)
                s.Replace(kv.Key, kv.Value != null ? kv.Value.ToString() : "");
            return s.ToString();
        }
    }
}
