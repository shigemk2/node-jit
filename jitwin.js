var ref = require("ref");
var ffi = require("ffi");
 
var kernel32 = ffi.Library("kernel32", {
    "VirtualAlloc": ["pointer", ["pointer", "size_t", "int", "int"]],
    "VirtualFree": ["bool", ["pointer", "int", "int"]],
});
 
var MEM_COMMIT  = 0x1000;
var MEM_RELEASE = 0x8000;
var PAGE_EXECUTE_READWRITE = 0x40;
 
function jitalloc(size) {
    var p = kernel32.VirtualAlloc(ref.NULL, size,
        MEM_COMMIT, PAGE_EXECUTE_READWRITE);
    var ret = p.reinterpret(size);
    ret.free = function() {
        kernel32.VirtualFree(p, 0, MEM_RELEASE);
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
        "\x89\xc8" +            // mov eax, ecx
        "\x01\xd0" +            // add eax, edx
        "\xc3", 0)              // ret
}
 
var func = ffi.ForeignFunction(buf, "int", ["int", "int"]);
console.log(func(1, 2));
 
buf.free();
