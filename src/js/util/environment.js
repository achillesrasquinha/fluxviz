const PREFIX = "FLUXVIZ";

const getenvvar = (name, prefix = PREFIX) => {
    const  variable = `${prefix}_${name}`
    return variable
}

const getenv    = (name, defaultValue = null, { prefix = PREFIX, seperator = "_" } = { }) => {
    const variable = `${prefix}${seperator}${name}`;
    const value    = process.env[variable] || defaultValue;

    return value;
};

export {
    PREFIX,
    getenvvar,
    getenv
};