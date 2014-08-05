var ref = require("ref");
var ffi = require("ffi");
var os  = process.platform;

var jitalloc = (function() {
    if (os == "win32") {
        var kernel32 = ffi.Library("kernel32", {
            "VirtualAlloc": ["pointer", ["pointer", "size_t", "int", "int"]],
            "VirtualFree": ["bool", ["pointer", "int", "int"]],
        });
        
        var MEM_COMMIT  = 0x1000;
        var MEM_RELEASE = 0x8000;
        var PAGE_EXECUTE_READWRITE = 0x40;
        
        return function(size) {
            var p = kernel32.VirtualAlloc(ref.NULL, size,
                                          MEM_COMMIT, PAGE_EXECUTE_READWRITE);
            var ret = p.reinterpret(size);
            ret.free = function() {
                kernel32.VirtualFree(p, 0, MEM_RELEASE);
            };
            return ret;
        };
    } else {
        var libc = ffi.Library("libc", {
            "mmap": ["pointer", ["pointer", "size_t", "int", "int", "int", "int64"]],
            "munmap": ["int", ["pointer", "size_t"]],
        });
        
        var PROT_READ   = 1;
        var PROT_WRITE  = 2;
        var PROT_EXEC   = 4;
        var MAP_PRIVATE = 2;
        var MAP_ANON    = os == "linux" || os == "linux2" ? 0x20 : 0x1000;
        
        return function(size) {
            var p = libc.mmap(ref.NULL, size,
                              PROT_READ | PROT_WRITE | PROT_EXEC,
                              MAP_PRIVATE | MAP_ANON, -1, 0);
            var ret = p.reinterpret(size);
            ret.free = function() {
                libc.munmap(p, size);
            };
            return ret;
        };
    }
})();

var buf = jitalloc(16);

if (ref.sizeof.pointer == 4) {
    // 32bit (i386)
    buf.binaryWrite(
        "\x8b\x44\x24\x04" +    // mov eax, [esp+4]
        "\x03\x44\x24\x08" +    // add eax, [esp+8]
        "\xc3", 0);             // ret
} else if (os == "win32") {
    // 64bit (x86-64) Windows
    buf.binaryWrite(
        "\x89\xc8" +            // mov eax, ecx
        "\x01\xd0" +            // add eax, edx
        "\xc3", 0)              // ret
} else {
    // 64bit (x86-64) System V ABI
    buf.binaryWrite(
        "\x89\xf8" +            // mov eax, edi
        "\x01\xf0" +            // add eax, esi
        "\xc3", 0);             // ret
}

var func = ffi.ForeignFunction(buf, "int", ["int", "int"]);
console.log(func(1, 2));

buf.free();
