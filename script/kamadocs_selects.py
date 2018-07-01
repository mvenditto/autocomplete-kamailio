from bs4 import BeautifulSoup as bs
from urllib.request import urlopen
import json
from collections import OrderedDict
import re

def get_type(category):
    return "function"
        

def idx_from_class(x):
    return int(x.attrs["class"].split("sectionedit")[1])

url = "https://www.kamailio.org/wiki/cookbooks/5.1.x/selects"

html = urlopen(url).read().decode('utf-8')
soup = bs(html, "lxml-xml")

keywords_start_from = 0 # jump to 'preprocess-directives'

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
    return None


for keyword_entry in zip(keywords[keywords_start_from:], descriptions[keywords_start_from:]):
    keyword = keyword_entry[0].text
    desc = keyword_entry[1].text
    category = get_category(idx_from_class(keyword_entry[0]))
    type_ = get_type(category)

    if category is None:
        c = re.findall(r"Exported by: (\w+)", desc)
        if len(c) > 0:
            category = c[0]

    entry = {
        "text": keyword,
        "description": desc,
        "descriptionMoreURL": url,
        "type": type_,
        "rightLabel": category
    }

    params = [m.start() for m in re.finditer("\%[s,i]", keyword)]
   
    if len(params) > 0:
        snip = keyword
        for p,i in zip(params, range(0, len(params))):
            t = keyword[p+1]
            snip = snip.replace("%"+t, "${%d: %s%d}" % (i + 1, t, i + 1))
        entry["snippet"] = entry["text"] = snip

    
    to_json.append(entry)
    

out = "/home/mvenditto/Scaricati/kamailio_5_1_x_selects.json"
with open(out, "w+") as json_out:
    json_out.write(json.dumps(to_json, indent=4))
