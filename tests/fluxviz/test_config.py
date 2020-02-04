from fluxviz.config  import Settings
from fluxviz         import __version__

def test_settings():
    settings = Settings()
    settings.get("version") == __version__