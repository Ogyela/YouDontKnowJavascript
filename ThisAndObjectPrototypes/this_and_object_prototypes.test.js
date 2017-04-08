var expect = require('chai').expect;

describe('This And Object Prototypes', function () {
	
	describe('Basic This Examples', function () {
	
		let identify, speak, me, you;

		beforeEach(function () {
			identify = function () {
				return this.name.toUpperCase();
			};

			speak = function () {
				return "Hello I'm " + identify.call(this);
			};

			me = { name: 'kyle' };
			you = { name: 'reader' };			
		});

		it('call identify', function () {
			expect(identify.call(me)).to.equal('KYLE');
			expect(identify.call(you)).to.equal('READER');
		});

		it('call speak', function () {
			expect(speak.call(me)).to.equal("Hello I'm KYLE");
			expect(speak.call(you)).to.equal("Hello I'm READER");
		});

	});
});