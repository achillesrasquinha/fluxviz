from fluxviz.util.request import proxy_request

def run(*args, **kwargs):
    response = proxy_request("GET", "http://bigg.ucsd.edu/static/namespace/bigg_models_metabolites.txt")
    response.raise_for_status()

    