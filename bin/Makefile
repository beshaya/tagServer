all: allow deny

allow: blink.o allow.c
	gcc blink.o allow.c -o allow

deny: blink.o deny.c
	gcc blink.o deny.c -o deny

blink.o: blink.c
	gcc -c blink.c

clean:
	rm *.o deny allow
