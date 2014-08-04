var ref = require("ref");
var ffi = require("ffi");
 
var libc = ffi.Library("libc", {
    "mmap": ["pointer", ["pointer", "size_t", "int", "int", "int", "int64"]],
    "munmap": ["int", ["pointer", "size_t"]],
});
 
var PROT_READ = 1;
var PROT_WRITE = 2;
var PROT_EXEC = 4;
var MAP_PRIVATE = 2;
var MAP_ANON = 0x1000;
 
function jitalloc(size) {
    var p = libc.mmap(ref.NULL, size,
        PROT_READ | PROT_WRITE | PROT_EXEC,
        MAP_PRIVATE | MAP_ANON, -1, 0);
    var ret = p.reinterpret(size);
    ret.free = function() {
        libc.munmap(p, size);
    };
    return ret;
}
 
var buf = jitalloc(16);
 
if (ref.sizeof.pointer == 4) {
    // 32bit (i386)
    buf.binaryWrite(
        "\x8b\x44\x24\x04" +    // mov eax, [esp+4]
        "\x03\x44\x24\x08" +    // add eax, [esp+8]
        "\xc3", 0);             // ret
} else {
    // 64bit (x86-64)
    buf.binaryWrite(
        "\x89\xf8" +            // mov eax, edi
        "\x01\xf0" +            // add eax, esi
        "\xc3", 0);             // ret
}
 
var func = ffi.ForeignFunction(buf, "int", ["int", "int"]);
console.log(func(1, 2));
 
buf.free();
