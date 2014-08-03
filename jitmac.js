ref = require("ref");
ffi = require("ffi");

mmap = ffi.ForeignFunction(ffi.DynamicLibrary("libc.dylib").get("mmap"), "pointer", ["pointer", "size_t", "int", "int", "int", "off_t"]);
function VirtualAlloc(address, size, protect, flag, fd, offset) {
    return mmap(address, size, protect, flag, fd, offset).reinterpret(size);
}
munmap = ffi.ForeignFunction(
  ffi.DynamicLibrary("libc.dylib").get("munmap"),
  "pointer", ["pointer", "size_t"]);
memmove = ffi.ForeignFunction(
  ffi.DynamicLibrary("libc.dylib").get("memmove"),
  "int", ["int", "int"]);

MEM_COMMIT  = 0x1000
MEM_RELEASE = 0x8000
PAGE_EXECUTE_READWRITE = 0x40

buf = VirtualAlloc(ref.NULL, 16, MEM_COMMIT, PAGE_EXECUTE_READWRITE)
codes = [
    0x48, 0x89, 0xf8, // mov rax, rdi
    0x48, 0x01, 0xf0, // add rax, rsi
    0xc3             // ret
];
buflen = codes.length;
mmap(65,65);

console.log(mmap(0,0));
console.log(munmap(0,65));
console.log(munmap(0,65));
// console.log(func2(9));
// console.log("f(1, 2) = %d", func(1, 2));
