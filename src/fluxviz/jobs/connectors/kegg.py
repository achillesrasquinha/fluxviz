from os import path
import os.path as osp
import re
import gzip

# from fluxviz import request as req
import requests as req

from fluxviz.util.system    import popen, PopenError
from fluxviz.util.proxy     import get_random_proxy, fetch as fetch_proxies
from fluxviz.util.array     import sequencify
from fluxviz.util.string    import strip
from fluxviz.util.environ   import getenv
from fluxviz.log            import get_logger
from fluxviz._compat        import iterkeys
from fluxviz.constant       import PATH

logger = get_logger()

class BaseAPI:
    def __init__(self, base_url = None,
            proxies = None):
        self.base_url = self.BASE_URL or None
        self.proxies  = proxies

    def build_url(self, *args, **kwargs):
        url = "/".join(sequencify(self.base_url) + sequencify(args))
        return url

    def request(self, method, url, *args, **kwargs):
        prefix   = kwargs.pop("prefix", True)
        
        if prefix:
            url  = self.build_url(url)

        if self.proxies:
            proxies = self.proxies() if callable(self.proxies) else self.proxies
            kwargs["proxies"] = proxies

        response = req.request(method, url, *args, **kwargs)
        response.raise_for_status()

        if response.text:
            return response.text

        return response

    def get(self, url, *args, **kwargs):
        return self.request(method = "GET", url = url, *args, **kwargs)

class KEGG(BaseAPI):
    BASE_URL = "http://rest.kegg.jp"

    def __init__(self, *args, **kwargs):
        self.super = super(KEGG, self)
        self.super.__init__(*args, **kwargs)

    def get(self, id_):
        content = self.super.get("get/%s" % id_)
        return content

    def list(self, type_):
        parts    = "list/%s" % type_
        url      = self.build_url(parts)

        content  = self.super.get(url = parts, headers = { "Referer": url })
        
        lines    = content.split("\n")

        data     = { }

        for line in lines:
            line = strip(line)

            if line:
                id_, meta = line.split("	")

            data[id_] = meta

        return data

def run(*args, **kwargs):
    # fetch_proxies()

    # kegg        = KEGG(proxies = lambda: { "http": get_random_proxy() })
    kegg        = KEGG()

    compounds   = kegg.list("compound")
    reactions   = kegg.list("reaction")

    for compound in iterkeys(compounds):
        content = kegg.get(compound)
        
        # if not osp.exists(content):
        #     print(content)

    for reaction in iterkeys(reactions):
        content = kegg.get(reaction)
        print(content)
        break

    # print(get_random_requests_proxies())

    # response = proxy_request("GET", "http://bigg.ucsd.edu/static/namespace/bigg_models_metabolites.txt")
    # response.raise_for_status()