function archy(obj, prefix, opts) {
    console.log("obj=", obj);
    console.log("pref=", prefix);
    console.log("opts=", opts);
    return "glop";
}
archy({ label: "glop" }, undefined, { unicodex: false });
