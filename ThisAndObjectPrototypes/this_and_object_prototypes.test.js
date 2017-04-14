var expect = require('chai').expect;

describe('This And Object Prototypes', function () {
	
	describe('Basic This Examples', function () {
	
		let identify, speak, me, you, ary, data, foo1, foo2, foo3;

		beforeEach(function () {
			identify = function () {
				return this.name.toUpperCase();
			};

			speak = function () {
				return "Hello I'm " + identify.call(this);
			};

			foo1 = function(num) {
				this.count++;
				return "foo1: " + num;
			}

			foo2 = function(num) {
				data.count++;
				return "foo2: " + num;
			}

			foo3 = function(num) {
				foo3.count++;
				return "foo3: " + num;
			}

			me = { name: 'kyle' };
			you = { name: 'reader' };
			ary = [];
			data = { count: 0 };			
		});

		it('call identify', function () {
			expect(identify.call(me)).to.equal('KYLE');
			expect(identify.call(you)).to.equal('READER');
		});

		it('call speak', function () {
			expect(speak.call(me)).to.equal("Hello I'm KYLE");
			expect(speak.call(you)).to.equal("Hello I'm READER");
		});

		it("'this' does not always refer to the function being invoked", function () {
			foo1.count = 0;
			for (var i = 0; i < 10; i++) {
				if (i > 5) {
					ary.push(foo1(i))
				}
			}
			expect(ary).to.deep.equal(['foo1: 6', 'foo1: 7', 'foo1: 8', 'foo1: 9']);
			expect(foo1.count).to.equal(0);
			/* 
				One can see the count property does not get updated upon repeated invocation
				of the foo1 fuction.  It is so because 'this' is not referring to the foo1
				function itself.  It turns out 'this' is some kind of global object which
				might be a mix of Node.js and Mocha.js properites.  I am not sure of the
				specifics but in the code above 'this' refers to some kind of globa object, we
				can conclude in the browser 'this' would be the window object.
			*/		
		});

		it("Not understanding how 'this' works, a brittle workaround is often used", function () {
			for (var i = 0; i < 10; i++) {
				if (i > 5) {
					ary.push(foo2(i))
				}
			}
			expect(ary).to.deep.equal(['foo2: 6', 'foo2: 7', 'foo2: 8', 'foo2: 9']);
			expect(data.count).to.equal(4);
			/*
				We can see this is a way to bypass a proper understanding of 'this', declare another object to
				keep track the number of times foo2 is called.  We can see continuing with such a solution
				would introduce too many objects in the design space.
			*/
		});

		it('If the function is named we can refer to the function itself inside the body of the function', function () {
			foo3.count = 0;
			for (var i = 0; i < 10; i++) {
				if (i > 5) {
					ary.push(foo3(i))
				}
			}
			expect(ary).to.deep.equal(['foo3: 6', 'foo3: 7', 'foo3: 8', 'foo3: 9']);
			expect(foo3.count).to.equal(4);
			/*
				Since foo3 is a named function I can refer to itself directly in the body of the function
			*/			
		});

		it("How to use 'this' properly", function () {
			foo1.count = 0;
			for (var i = 0; i < 10; i++) {
				if (i > 5) {
					ary.push(foo1.call(foo1, i))
				}
			}
			expect(ary).to.deep.equal(['foo1: 6', 'foo1: 7', 'foo1: 8', 'foo1: 9']);
			expect(foo1.count).to.equal(4);
			/*
				We can refer designate foo1 as 'this' explicitly by invoking the call function, this is the 
				most consistent and clean way to ensure the call count gets updated
			*/			
		});

	}); // describe Basic This Examples


	describe('Default Binding Rule', function () {

		var a, foo;

		beforeEach(function () {
			a = 2;
			foo = function () {
				return this.a;
			}
		});
		
		it('for ES6 function declarations are in strict mode', function () {
			expect(a).to.equal(2);
			expect(foo()).to.be.undefined;
			// prior to ES6 'this' was the global object by default, meaning 'a' was now a property
			// on the global object.  In the past foo() would have returned 2 without the 'strict'
			// declaration inside the function declaration.  With the 'strict' declaration the global object
			// is not available for the default binding.  So as we can see from the assertions above
			// 'a' is declared and assigned in the global object space however, 'this', which refers to the
			// global object, is not avaiable for the default binding so it is undefined.
		});

	}); // describe Default Binding Rule

	describe('Implicit Binding Rule', function () {

		var obj, foo;

		beforeEach(function () {
			foo = function () {
				return this.a;
			}
			obj = {
				a: 2,
				foo: foo
			}					
		});

		it('at the time of function invocation, the object provides the context for this', function () {
			expect(obj.foo()).to.equal(2);
			// so in this case even though the function foo is defined outside of the object declaration at
			// the time of function invocation, the object which is the receiver of the method call provies
			// the context for 'this', so in this case 'this' refers to 'obj' which includes the property 'a'				
		});


		it('implicit binding can be lost', function () {
			var bar = obj.foo;
			var a = "oops, I lost my binding";
			expect(bar()).to.be.undefined;
			/*
			in this case bar is nothing but a reference to the function foo(), so when a is redefiend at the global
			level the default binding rule takes precedence but because we are using ES6, the global object is not
			available for default binding so the output is undefined.
			*/
		});	

	}); // describe Implicit Binding Rule

	describe('Explicit and Hard Binding', function () {
		
		var obj, foo, foo1;

		beforeEach(function () {
			foo = function () {
				return this.a;
			}
			foo1 = function (something) {
				return this.a + something;
			}
			obj = { a: 2 }
		});

		it('explicitly bind a value for this to the function by using call() or apply()', function () {
			expect(foo.call(obj)).to.equal(2);
		});

		it('hard binding, defined a function which returns the explicitly bound function', function () {
			function bar() {
				return foo1.apply(obj, arguments);
			}
			var b = bar(3);
			expect(b).to.equal(5);
			/*
			I was confused as to how this hard binding works.  The key to understanding the concept here is
			that the function bar returns a function, so when we invoke bar by var b = bar(3) we are actually
			calling the foo1.apply(obj, arguments) function, this is why bar can recieve arguments when at the
			beginning of its function declaration function bar () {...} it does not have any arguments.
			*/
		});

		it('programmatically invoke a hard binding', function () {
			function myBind(fn, obj) {
				return function() {
					return fn.apply(obj, arguments);
				}
			}
			var bar = myBind(foo1, obj);
			var b = bar(3);
			expect(b).to.equal(5);
			/*
			In this case we have to return a function from the myBind function.  This is so because the statement
			var bar = myBind(foo1, obj) only references the function defined within the body.  So bar = myBind(foo1, obj);
			really is now defined as function() { return fn.apply(obj, arguments); }, but bar needs to be invoked to have
			any effect, so now the invocation has the same effect as the previous example, where '3' is passed in as
			arguments.
			*/
		});

		it('however, javascript provides its own bind operator', function () {
			var bar = foo1.bind(obj);
			expect(bar(3)).to.equal(5);
		});
	}); // describe Explicit and Hard Binding

	describe('New Constructor Call', function () {
		
		var Foo;

		beforeEach(function () {
			Foo = function (a) {
				this.a = a;
			}		
		});

		it("produces a new object with 'this' set to the newly created object", function () {
			let foo = new Foo(3);
			expect(foo.a).to.equal(3);		
		});
	});

	describe('Order of Precedence For this binding operations', function () {

		var Foo, obj1, obj2;

		beforeEach(function () {
			Foo = function () {
				return this.a;
			}
			obj1 = { a: 2, foo: Foo };
			obj2 = { a: 3, foo: Foo };
		});
		
		it('explicit over implicit', function () {
			expect(obj1.foo()).to.equal(2);
			expect(obj2.foo()).to.equal(3);
			expect(obj1.foo.call(obj2)).to.equal(3);
			expect(obj2.foo.call(obj1)).to.equal(2);		
		});
	});

}); // describe This And Object Prototypes