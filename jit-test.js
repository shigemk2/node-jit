ffi = require("ffi");
// win
// p_putchar = ffi.DynamicLibrary("msvcrt").get("putchar");
// mac
p_putchar = ffi.DynamicLibrary("libc.dylib").get("putchar");

putchar = ffi.ForeignFunction(p_putchar, "int", ["int"]);
putchar(65);
