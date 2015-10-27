all: allow deny open

allow: blink.o allow.c
	gcc blink.o allow.c -o allow
	mv allow ../bin

deny: blink.o deny.c
	gcc blink.o deny.c -o deny
	mv deny ../bin

open: blink.o open.c
	gcc blink.o open.c -o open
	mv open ../bin

blink.o: blink.c
	gcc -c blink.c

clean:
	rm *.o deny allow
