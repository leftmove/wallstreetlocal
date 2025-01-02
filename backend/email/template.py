import os

import jinja2

from ..routers.lib import database

cwd = os.getcwd()
template_loader = jinja2.FileSystemLoader(searchpath=f"{cwd}/email/templates")
template_env = jinja2.Environment(loader=template_loader)


def holding_template(cik: str, access_number: str) -> str:

    filer = database.find_filer(cik)
    if filer is None:
        raise LookupError

    filing = database.find_filing(cik, access_number)
    if filing is None:
        raise LookupError

    template = template_env.get_template("holding.html")
    output = template.render(filer=filer, filing=filing)

    return output
