from ctypes import *
 
VirtualAlloc = windll.kernel32.VirtualAlloc
VirtualFree  = windll.kernel32.VirtualFree
MEM_COMMIT   = 0x1000
MEM_RELEASE  = 0x8000
PAGE_EXECUTE_READWRITE = 0x40
 
codes = (c_ubyte * 32)(
    0x8b, 0x44, 0x24, 0x04, # mov eax, [esp+4]
    0x03, 0x44, 0x24, 0x08, # add eax, [esp+8]
    0xc3,                   # ret
)
 
buflen = len(codes)
p = VirtualAlloc(0, buflen, MEM_COMMIT, PAGE_EXECUTE_READWRITE)
memmove(p, addressof(codes), buflen)
f = CFUNCTYPE(c_int, c_int, c_int)(p)
 
print "f(1, 2) = %d" % f(1, 2)
 
VirtualFree(p, 0, MEM_RELEASE)
