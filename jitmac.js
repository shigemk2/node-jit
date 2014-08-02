ref = require("ref");
ffi = require("ffi");

mmap = ffi.ForeignFunction(
  ffi.DynamicLibrary("libc.dylib").get("mmap"),
  "int", ["int", "int"]);
munmap = ffi.ForeignFunction(
  ffi.DynamicLibrary("libc.dylib").get("munmap"),
  "int", ["int", "int"]);
memmove = ffi.ForeignFunction(
  ffi.DynamicLibrary("libc.dylib").get("memmove"),
  "int", ["int", "int"]);

PROT_READ   = 1;
PROT_WRITE  = 2;
PROT_EXEC   = 4;
MAP_PRIVATE = 2;
MAP_ANON    = 0x1000;

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
