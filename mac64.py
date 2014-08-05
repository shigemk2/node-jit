from ctypes import *
 
libc = cdll.LoadLibrary("libc.dylib")
mmap = libc.mmap
mmap.restype = c_void_p
munmap = libc.munmap
munmap.argtype = [c_void_p, c_size_t]
 
PROT_READ   = 1
PROT_WRITE  = 2
PROT_EXEC   = 4
MAP_PRIVATE = 2
MAP_ANON    = 0x1000
 
codes = (c_ubyte * 32)(
    0x48, 0x89, 0xf8, # mov rax, rdi
    0x48, 0x01, 0xf0, # add rax, rsi
    0xc3,             # ret
)
 
buflen = len(codes)
p = mmap(0, buflen,
         PROT_READ | PROT_WRITE | PROT_EXEC,
         MAP_PRIVATE | MAP_ANON, -1, 0)
memmove(p, addressof(codes), buflen)
f = CFUNCTYPE(c_int, c_int, c_int)(p)
 
print "f(1, 2) = %d" % f(1, 2)
 
munmap(p, buflen)
