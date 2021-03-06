from bs4 import BeautifulSoup as bs
from urllib.request import urlopen
import json
from collections import OrderedDict
import re

def get_type(category):
    try:
        c = category.split()
        t = c[1].lower()
        if t == "keywords":
            return "keyword"
        elif t == "values":
            return "value"
        elif t == "parameters":
            return "variable"
        elif t == "functions":
            return "function"
        elif t == "pre-processor":
            return "import"
        else:
            return "value"
    except Exception as ex:
        print(ex)
        return "value"
        

def idx_from_class(x):
    return int(x.attrs["class"].split("sectionedit")[1])

url = "https://www.kamailio.org/wiki/cookbooks/5.1.x/core"

html = urlopen(url).read().decode('utf-8')
soup = bs(html, "lxml-xml")

keywords_start_from = 10 # jump to 'preprocess-directives'

h2 = soup.find_all("h2", class_ = lambda cls: cls.startswith("sectionedit"))
categories_ = list(map(lambda x: (x.text, idx_from_class(x)), h2))
categories_ = { idx:c for c,idx in categories_ }
categories = OrderedDict(sorted(categories_.items()))

keywords = soup.find_all("h3", class_ = lambda cls: cls.startswith("sectionedit"))
descriptions = soup.find_all("div", class_ = "level3")

if len(keywords) != len(descriptions):
    raise Exception("scraping error, entry number mismatch!")

to_json =[]

def get_category(idx):
    latest = None
    for cat_idx in categories.keys():
        if cat_idx < idx:
            latest = cat_idx
            continue
        else:
            return categories[latest]
    return ""


for keyword_entry in zip(keywords[keywords_start_from:], descriptions[keywords_start_from:]):
    keyword = keyword_entry[0].text
    desc = keyword_entry[1].text
    category = get_category(idx_from_class(keyword_entry[0]))
    type_ = get_type(category)

    entry = {
        "text": keyword,
        "description": desc,
        "descriptionMoreURL": url,
        "type": type_,
        "rightLabel": category
    }

    

    if type_ == "function":
        entry["text"] = "%s()" % entry["text"]


    args = re.findall(r"\w*" + keyword + "\((.+)\)\w*", desc)
    if len(args) > 1:
        r = args[0].split(",")
        n_args = len(r)
        print(keyword, n_args, args)
        if n_args > 1:
            sign = ",".join(["${%d: arg%d}" % (i+1,i+1) for i in range(0, len(r))])
            entry["snippet"] = "%s(%s)" % (keyword, sign)
        elif n_args == 1:
            entry["snippet"] = "%s(${1: arg1})" % keyword
            

    to_json.append(entry)
    

out = "/home/mvenditto/Scaricati/kamailio_5_1_x_core.json"
with open(out, "w+") as json_out:
    json_out.write(json.dumps(to_json, indent=4))

