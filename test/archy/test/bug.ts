interface Data {
   label: string;
   nodes?: (Data | string)[];
}
interface Options {
   unicode?: boolean;
}

function archy(obj: Data, prefix?: string, opts?: Options) : string {
   console.log( "obj=", obj );
   console.log( "pref=", prefix );
   console.log( "opts=", opts );
   
   return "glop";
}

archy( { label: "glop" }, undefined, { unicodex: false } );
