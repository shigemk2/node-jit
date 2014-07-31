ref = require("ref")
ffi = require("ffi")

pVirtualAlloc = ffi.ForeignFunction(
    ffi.DynamicLibrary("kernel32").get("VirtualAlloc"),
    "pointer", ["pointer", "size_t", "int", "int"])
function VirtualAlloc(address, size, allocationType, protect) {
    return pVirtualAlloc(address, size, allocationType, protect).
        reinterpret(size)
}
VirtualFree = ffi.ForeignFunction(
    ffi.DynamicLibrary("kernel32").get("VirtualFree"),
    "bool", ["pointer", "int", "int"])
MEM_COMMIT  = 0x1000
MEM_RELEASE = 0x8000
PAGE_EXECUTE_READWRITE = 0x40

buf = VirtualAlloc(ref.NULL, 16, MEM_COMMIT, PAGE_EXECUTE_READWRITE)
if (ref.sizeof.pointer == 4) {
    // 32bit (i386)
    buf.binaryWrite(
        "\x8b\x44\x24\x04" +    // mov eax, [esp+4]
        "\x03\x44\x24\x08" +    // add eax, [esp+8]
        "\xc3", 0)              // ret
} else {
    // 64bit (x86-64)
    buf.binaryWrite(
        "\x89\xc8" +            // mov eax, ecx
        "\x01\xd0" +            // add eax, edx
        "\xc3", 0)              // ret
}

func = ffi.ForeignFunction(buf, "int", ["int", "int"])
console.log(func(1, 2))

VirtualFree(buf, 0, MEM_RELEASE)
