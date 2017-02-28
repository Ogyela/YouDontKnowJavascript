var expect = require('chai').expect;

describe('Basic Scope And Closures', function () {
 
  it('simple example of a closure', function () {

    function foo () {
      var a = 2;
      function bar () {
        return a;
      }
      return bar;
    }

  // it is very important to understand what is going
  // on with respect to identifying a closure.  In this
  // case the function bar has lexical scope access to
  // the inner scope of foo.  In this case we return a reference
  // to this function -> return bar.  We execute foo and assign its
  // return value to the variable baz, the return value of course
  // being a reference to the inner function bar.  Since bar has
  // access to the inner scope of foo, like the variable 'a', baz
  // also has the same access to that inner scope even though baz
  // was declared outside the scope of foo.  It is as if bar has
  // 'held on' to its scope even when being called outside the inner
  // scope of foo     

    var baz = foo();
    expect(baz()).to.equal(2);
  });

  it('another example of the use of closure', function () {
    function foo () {
      var a = 2;
      function baz () {
        return a;
      }
      return bar(baz);
    }

    function bar (fn) {
      return fn();
    }

  // function bar has access to the inner scope of
  // foo because its arguemnt is baz which has a closure
  // over the inner scope of foo.

    expect(foo()).to.equal(2); 
  });

  it('assign inner scope to a global variable', function () {
    var fn;
    function foo () {
      var a = 2;
      function baz () {
        return a;
      }
      fn = baz;
    }

    function bar () {
      return fn();
    }

    foo(); // makes the assignment fn = baz
    expect(bar()).to.equal(2); // executes closure of baz
  });

}); // describe Basic Scope And Closures 

describe('Scope And Closures For Loops', function () {
  
  it('loops and closure function definition results', function () {
    var funcs = [];
    var var_ary = [];
    var capture_ary = [];
    var func_definition_string = "function () {\n        capture_ary.push(i);\n        return i;\n      }";
    for (var i = 0; i <= 5; i++) {
      var_ary.push(i);
      funcs[i] = function() {
        capture_ary.push(i);
        return i;
      }

      expect(funcs[i].toString()).to.equal(func_definition_string);

    // this whole concept of closure can be a difficult thing to understand
    // In the body of this loop we have nothing more than a function
    // definition assigned to each element of the funcs array
    // note the var_ary is filled with each value of i as the loop
    // progresses but capture_ary is empty.  This happens because
    // though funcs[i] has closure over everything in the it assertion
    // function, no element of funcs[i] is being called in this
    // assertion.  Thus, there is no requirement to exercise closure and
    // obtain a value of i to push onto the caputre_ary.  The key thing
    // to understand is that only function definitions are taking place in the
    // loop, the closure is being established as all closures are established
    // when a function is defined, however the results of exercising the closure
    // only happen when the function is called.  No where in this loop is any
    // element of the funcs array being called.  So the capture_ary is empty
    // because that statement is not being executed, as none of the elements of
    // the funcs array are being called. 

    }

    expect(var_ary).to.deep.equal([0, 1, 2, 3, 4, 5]);
    expect(capture_ary).to.deep.equal([]);
  });

 

  it('loops and closure function execution results in the loop', function () {
    var funcs = [];
    var var_ary = [];
    var capture_ary = [];
    var ary = [];
    for (var i = 0; i <= 5; i++) {
      var_ary.push(i);
      funcs[i] = function() {
        capture_ary.push(i);
        return i;
      }

      expect(funcs[i]()).to.equal(i);
    }

  // This combined with the previous assertion, helps to consolidate how one
  // understands closure.  Note how the values returned by each element of
  // funcs varies depending on where the funcs element is called.  In all cases
  // since each element of funcs is being called, the closure for each function
  // in funcs is begin executed.  In the case of the assertion expect(funcs[i]()).to.equal(i);
  // funcs[i] is being executed upon each iteration through the loop, thus the closue which
  // fetches the value of i is current state of the loop.  This happens because the function
  // is defined, establishing the closure, and then immediately called, so the closure returns
  // the current value of i.  Essentially, all of the closures are the same for each function
  // in funcs it just so happens immediate execution causes the current value of i to be obtained.
  // below in ary.push(funcs[j]()), all of the functions are defined and have the same closure
  // as they all have access to the same enclosing scope.  However, the execution call takes place
  // after the loop has defined all of the functions.  This means only one value of i can be used
  // as all functions share the same closure.  The only value of i common to all functions is what
  // i is after the loop has finished, which is the value 6.  Note how the ary caputres this result
  // as does capture_ary.  capture_ary starts with 0-5 because i is pushed onto the array each time
  // through the loop as each function is called right after it is defined.  The next 6 values in
  // capture_ary are all 6's because the functions are being called outside of the loop.  Since all
  // of the functions share the same closure, they must all have the same value of i to refer to.  The
  // only value of i that satisfies this is the value of i at the end of the loop.

    for (var j = 0; j <= 5; j++) {
      ary.push(funcs[j]());
    }

    expect(ary).to.deep.equal([6, 6, 6, 6, 6, 6]);
    expect(var_ary).to.deep.equal([0, 1, 2, 3, 4, 5]);
    expect(capture_ary).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6]);
  });

 

  it('one way to fix the closure problem within a loop', function () {
    function bar (int) {
      return int;
    }
    var funcs = [];
    var other_funcs = [];
    for(var i = 0; i <= 5; i++) {
      funcs[i] = (function (j) {
        return j;
      })(i);
      other_funcs[i] = bar(i);
    }

    for (var j = 0; j <= 5; j++) {
      expect(funcs[j]).to.equal(j);
      expect(other_funcs[j]).to.equal(j);
    }

  // the IIFE creates and then closes over a unique scope for each
  // iteration through the loop.
  // this fixes the problem because an IIFE creates its own closure
  // by function declaration and immeditate execution.  This is essentially
  // what we did in the assertion above when we defined the function and the
  // executed it right away within the body of the loop.  We can acheive the
  // same result by defining the function outside the loop and then executing
  // it in the loop by passing in i as a parameter.
  });

  it('best solution block scoping with let', function () {
    var funcs = [];
    for(var i = 0; i <= 5; i++) {
      let j = i;
      funcs[i] = function () {
        return j;
      }
    }
    for(var j = 0; j <= 5; j++) {
      expect(funcs[j]()).to.equal(j);
    }       
  }); 

  it('reduced let implementation', function () {
    var funcs = [];
    for (let i = 0; i <= 5; i++) {
      funcs[i] = function () {
        return i;
      }
    }
    for (let j = 0; j <= 5; j++) {
      expect(funcs[j]()).to.equal(j);
    }
  });

}); // describe Scopes And Closures For Loops

describe('Scopes And Closures Module Patterns', function () {

  it('basic module pattern, the revealing module', function () {
    function CoolModule () {
      var something = "cool";
      var another = [1, 2, 3];

      function doSomething () {
        return something;
      }

      function doAnother () {
        return another;
      }

      return {
        doSomething: doSomething,
        doAnother: doAnother
      }
    }      

    var foo = CoolModule();
    expect(foo.doSomething()).to.equal('cool');
    expect(foo.doAnother()).to.deep.equal([1, 2, 3]);
  });

  it('return an inner function', function () {
    function CoolModule () {
      var something = "cool";

      function doSomething () {
        return something;
      }

      return doSomething;
    }

    var foo = CoolModule();
    expect(foo()).to.equal('cool');              
  });

  it('module pattern with IIFE', function () {
      var foo = (function CoolModule () {
      var something = "cool";
      var another = [1, 2, 3];

      function doSomething () {
        return something;
      }

      function doAnother () {
        return another;
      }

      return {
        doSomething: doSomething,
        doAnother: doAnother
      }
    })();
    expect(foo.doSomething()).to.equal('cool');
    expect(foo.doAnother()).to.deep.equal([1, 2, 3]);      
  });  

  it('modules with parameters', function () {
    function CoolModule (id) {

      function identify () {
        return id;
      }

      return {
        identify: identify
      }
    }

    var foo1 = CoolModule('foo 1');
    var foo2 = CoolModule('foo 2');

    expect(foo1.identify()).to.equal('foo 1');
    expect(foo2.identify()).to.equal('foo 2');
  });

}); // describe Scopes and Closures Module Pattern
