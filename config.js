import path from "path";

const PATH  = { };
PATH.BASE   = path.dirname(__filename);
PATH.TEST   = path.join(PATH.BASE, "tests", "js"); 

export { PATH };