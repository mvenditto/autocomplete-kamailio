from bs4 import BeautifulSoup as bs
from urllib.request import urlopen
import json
from collections import OrderedDict
import re

core = "https://www.kamailio.org/wiki/cookbooks/5.1.x/core"
pseudovariables = "https://www.kamailio.org/wiki/cookbooks/5.1.x/pseudovariables"


def idx_from_class(x):
    return int(x.attrs["class"].split("sectionedit")[1])

url = pseudovariables

with_arg = r"(\$\w*\()(\w*)(\))\w*"

html = urlopen(url).read().decode('utf-8')
soup = bs(html, "lxml-xml")

keywords_start_from = 0 

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

    try:
        tok = keyword.split("-")
        if len(tok) > 1:
            instruction = tok[0].rstrip()
            name = tok[1]
        else:
            instruction = name = keyword
            
        as_json =  {
            "text": instruction,
            "displayText": instruction, 
            "description": name + "[" + category + "]\n" + desc,
            "descriptionMoreURL": url,
            "type": "variable",
            "rightLabel": name
        }
        
        if re.match(with_arg, keyword) is not None:
            as_json["snippet"] = re.sub(with_arg, "\g<1>${1:\g<2>}\g<3>", instruction)
        
        to_json.append(as_json)
    except Exception as err:
        print("skipping: " + keyword + " cause:" + str(err))

    
out = "/home/mvenditto/Scaricati/kamailio_5_1_x_pseudovars.json"
with open(out, "w+") as json_out:
    json_out.write(json.dumps(to_json, indent=4))

