import json

from bs4 import BeautifulSoup

from fluxviz.util.request import proxy_request
from fluxviz.util.array   import chunkify
from fluxviz._compat      import iterkeys, iteritems
from fluxviz.log          import get_logger

URL_BASE = "https://www.genome.jp"

logger   = get_logger()

def get_universal_bigg_model():
    response = proxy_request("GET", "http://bigg.ucsd.edu/static/namespace/universal_model.json")
    response.raise_for_status()

    return response.json()

def get_kegg_id_from_bigg_element(element, type_):
    annotations = element["annotation"]

    keggs       = [ ]

    for annotation in annotations:
        if annotation[0] == type_:
            elements = annotation[1:]

            for e in elements:
                name = e.rsplit("/", 1)[-1]

                if name not in keggs:
                    keggs = [ name ]
                else:
                    keggs.append(name)

    if len(keggs):
        assert len(keggs) == 1

    return keggs[0] if len(keggs) else None

def bigg2kegg(bigg_id):
    data = get_universal_bigg_model()

    metabolite_map = dict((o["id"], o) for o in data["metabolites"])

    kegg2bigg = { }

    for reaction in data["reactions"]:
        found = True

        for metabolite, coeff in iteritems(reaction["metabolites"]):
            if metabolite not in kegg2bigg:
                metabolite  = metabolite_map[metabolite]

                kegg_id     = get_kegg_id_from_bigg_element(metabolite, "KEGG Compound")
                kegg2bigg[ metabolite["id"] ] = kegg_id

                if not kegg_id:
                    logger.warn("Unable to fetch KEGG ID for BiGG Reaction: %s, insufficient data." % reaction["id"])
                    found = False
                    break

        if found:
            pass

    # def to_id_map(elements):
    #     return dict((o["id"], o) for o in elements)

    # metabolites = to_id_map(data["metabolites"])
    # reactions   = to_id_map(data["reactions"])

    # bigg_id_reactions   = [ o["id"] for o in data["reactions"] ]
    # bigg_id_metabolites = [ o["id"] for o in data["metabolites"] ]

def get_kegg_coordinates():
    pathway  = "01100"
    
    url      = "%s/%s" % (URL_BASE, "/pathway/map%s" % pathway)
    
    response = proxy_request("GET", url)
    response.raise_for_status()

    soup        = BeautifulSoup(response.content, "html.parser")

    emap        = soup.find("map", { "id": "mapdata" })

    elements    = [ ]

    def gpc(coords):
        offset  = 8
        chunks  = chunkify(coords, offset)

        return chunks

    for a in emap.find_all("area"):
        coords      = list(map(int, a["coords"].split(",")))

        if "data-entry" in a.attrs and a["data-entry"].startswith("C"):
            elements.append({
                "name": a["data-entry"],
                "type": "compound",
                "coords": (coords[0], coords[1])
            })
        
        href        = a["href"]
        parts       = href.split("/")[-1]
        entries     = parts.split("+")

        reaction    = [entry for entry in entries if entry.startswith("R")]

        for r in reaction:
            elements.append({
                "name": r,
                "type": "reaction",
                "coords": gpc(coords)
            })

    keggs = { }

    for element in elements:
        name = element["name"]
        if name not in keggs:
            keggs[name] = [ element["coords"] ]
        else:
            keggs[name].append( element["coords"] )
    
    return keggs

def get_kegg_to_bigg_id_mappings():
    data     = get_universal_bigg_model()
    
    keggs    = dict((o["id"], get_kegg_ids_from_bigg_element(o))
        for o in data["metabolites"])

    return keggs

def run(*args, **kwargs):
    elements  = get_kegg_coordinates()
    kegg2bigg = get_kegg_to_bigg_id_mappings()

    positions = { }

    for element, bigg in iteritems(kegg2bigg):
        coordinates = elements.get(element, [])

        for id_ in bigg:
            if id_ not in positions:
                positions[id_] = coordinates
            else:
                positions[id_] = positions[id_] + coordinates

    for id_ in iterkeys(positions):
        if not positions[id_]:
            positions[id_] = None
                
    with open("position.json", "w") as f:
        json.dump(positions, f, indent = 4)