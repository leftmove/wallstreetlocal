if __name__ == "__main__":
    from os.path import dirname, basename, isfile, join
    import glob
    modules = glob.glob(join(dirname(__file__), "*.py"))
    print(join(dirname(__file__), "*.py"))
    __all__ = ["\t\"" + basename(f)[:-3]+"\",\n" for f in modules if isfile(
        f) and not f.endswith('__init__.py') and not f.endswith('__add__manager.py')]

    f = open(join(dirname(__file__), "__init__.py"), "a")
    f.write("__all__ = [\n")
    f.writelines(__all__)
    f.write("]\n")
    f.close()
