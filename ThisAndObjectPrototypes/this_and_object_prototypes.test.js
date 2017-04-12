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
}); // describe This And Object Prototypes