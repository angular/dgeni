/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*global require describe it*/
/*jslint node:true */
'use strict';

var doctrine = require('../doctrine');
require('should');

describe('parse', function () {
    it('const', function () {
        var res = doctrine.parse('/** @const */', { unwrap: true });
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'const');
    });

    it('const multiple', function () {
        var res = doctrine.parse("/**@const\n @const*/", { unwrap: true });
        res.tags.should.have.length(2);
        res.tags[0].should.have.property('title', 'const');
        res.tags[1].should.have.property('title', 'const');
    });

    it('const double', function () {
        var res = doctrine.parse("/**@const\n @const*/", { unwrap: true });
        res.tags.should.have.length(2);
        res.tags[0].should.have.property('title', 'const');
        res.tags[1].should.have.property('title', 'const');
    });

    it('const triple', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * @const @const",
                " * @const @const",
                " * @const @const",
                " */"
            ].join('\n'), { unwrap: true });
        res.tags.should.have.length(3);
        res.tags[0].should.have.property('title', 'const');
        res.tags[1].should.have.property('title', 'const');
        res.tags[2].should.have.property('title', 'const');
    });

    it('param', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * @param {String} userName",
                "*/"
            ].join('\n'), { unwrap: true });
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'userName');
        res.tags[0].should.have.property('type');
        res.tags[0].type.should.eql({
            type: 'NameExpression',
            name: 'String'
        });
    });

    it('param broken', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * @param {String} userName",
                " * @param {String userName",
                "*/"
            ].join('\n'), { unwrap: true });
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'userName');
        res.tags[0].should.have.property('type');
        res.tags[0].type.should.eql({
            type: 'NameExpression',
            name: 'String'
        });
    });

    it('param record', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * @param {{ok:String}} userName",
                "*/"
            ].join('\n'), { unwrap: true });
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'userName');
        res.tags[0].should.have.property('type');
        res.tags[0].type.should.eql({
            type: 'RecordType',
            fields: [{
                type: 'FieldType',
                key: 'ok',
                value: {
                    type: 'NameExpression',
                    name: 'String'
                }
            }]
        });
    });

    it('param record broken', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * @param {{ok:String} userName",
                "*/"
            ].join('\n'), { unwrap: true });
        res.tags.should.be.empty;
    });

    it('param without braces', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * @param string name description",
                "*/"
            ].join('\n'), { unwrap: true });
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'name');
        res.tags[0].should.have.property('type');
        res.tags[0].type.should.eql({
            type: 'NameExpression',
            name: 'string'
        });
        res.tags[0].should.have.property('description', 'description');
    });

    it('description and param separated by blank line', function () {
        var res = doctrine.parse(
            [
                "/**",
                " * Description",
                " * blah blah blah",
                " *",
                " * @param string name description",
                "*/"
            ].join('\n'), { unwrap: true });
        res.description.should.eql('Description\nblah blah blah');
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'name');
        res.tags[0].should.have.property('type');
        res.tags[0].type.should.eql({
            type: 'NameExpression',
            name: 'string'
        });
        res.tags[0].should.have.property('description', 'description');
    });

    it('regular block comment instead of jsdoc-style block comment', function () {
        var res = doctrine.parse(
            [
                "/*",
                " * Description",
                " * blah blah blah",
                "*/"
            ].join('\n'), { unwrap: true });
        res.description.should.eql("Description\nblah blah blah");
    });
});

describe('parseType', function () {
    it('union type closure-compiler extended', function () {
        var type = doctrine.parseType("string|number");
        type.should.eql({
            type: 'UnionType',
            elements: [{
                type: 'NameExpression',
                name: 'string'
            }, {
                type: 'NameExpression',
                name: 'number'
            }]
        });
    });

    it('empty union type', function () {
        var type = doctrine.parseType("()");
        type.should.eql({
            type: 'UnionType',
            elements: []
        });
    });

    it('comma last array type', function () {
        var type = doctrine.parseType("[string,]");
        type.should.eql({
            type: 'ArrayType',
            elements: [{
                type: 'NameExpression',
                name: 'string'
            }]
        });
    });

    it('comma last record type', function () {
        var type = doctrine.parseType("{,}");
        type.should.eql({
            type: 'RecordType',
            fields: []
        });
    });

    it('type application', function () {
        var type = doctrine.parseType("Array.<String>");
        type.should.eql({
            type: 'TypeApplication',
            expression: {
                type: 'NameExpression',
                name: 'Array'
            },
            applications: [{
                type: 'NameExpression',
                name: 'String'
            }]
        });
    });

    it('type application with multiple patterns', function () {
        var type = doctrine.parseType("Array.<String, Number>");
        type.should.eql({
            type: 'TypeApplication',
            expression: {
                type: 'NameExpression',
                name: 'Array'
            },
            applications: [{
                type: 'NameExpression',
                name: 'String'
            }, {
                type: 'NameExpression',
                name: 'Number'
            }]
        });
    });

    it('type application without dot', function () {
        var type = doctrine.parseType("Array<String>");
        type.should.eql({
            type: 'TypeApplication',
            expression: {
                type: 'NameExpression',
                name: 'Array'
            },
            applications: [{
                type: 'NameExpression',
                name: 'String'
            }]
        });
    });

    it('function type simple', function () {
        var type = doctrine.parseType("function()");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [],
		 "result": null
		});
    });
    it('function type with name', function () {
        var type = doctrine.parseType("function(a)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		{
		   "type": "NameExpression",
		   "name": "a"
		  }
			 ],
		 "result": null
		});
    });
    it('function type with name and type', function () {
        var type = doctrine.parseType("function(a:b)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
		   "type": "ParameterType",
		   "name": "a",
		   "expression": {
		    "type": "NameExpression",
		    "name": "b"
		   }
		  }
		 ],
		 "result": null
		});
    });
    it('function type with optional param', function () {
        var type = doctrine.parseType("function(a=)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
		   "type": "OptionalType",
		   "expression": {
		    "type": "NameExpression",
		    "name": "a"
		   }
		  }
		 ],
		 "result": null
		});
    });
    it('function type with optional param name and type', function () {
        var type = doctrine.parseType("function(a:b=)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
		   "type": "OptionalType",
		   "expression": {
		    "type": "ParameterType",
		    "name": "a",
		    "expression": {
		     "type": "NameExpression",
		     "name": "b"
		    }
		   }
		  }
		 ],
		 "result": null
		});
    });
    it('function type with rest param', function () {
        var type = doctrine.parseType("function(...a)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
		   "type": "RestType",
		   "expression": {
		    "type": "NameExpression",
		    "name": "a"
		   }
		  }
		 ],
		 "result": null
		});
    });
    it('function type with rest param name and type', function () {
        var type = doctrine.parseType("function(...a:b)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
		   "type": "RestType",
		   "expression": {
		    "type": "ParameterType",
		    "name": "a",
		    "expression": {
		     "type": "NameExpression",
		     "name": "b"
		    }
		   }
		  }
		 ],
		 "result": null
		});
    });

    it('function type with optional rest param', function () {
        var type = doctrine.parseType("function(...a=)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
			"type": "RestType",
			"expression": {
			   "type": "OptionalType",
			   "expression": {
			    "type": "NameExpression",
			    "name": "a"
			   }
			  }
			}
		 ],
		 "result": null
		});
    });
    it('function type with optional rest param name and type', function () {
        var type = doctrine.parseType("function(...a:b=)");
        type.should.eql({
		 "type": "FunctionType",
		 "params": [
		  {
			"type": "RestType",
			"expression": {
			   "type": "OptionalType",
			   "expression": {
			    "type": "ParameterType",
			    "name": "a",
			    "expression": {
			     "type": "NameExpression",
			     "name": "b"
			    }
			  }
			}
		 }],
		 "result": null
		});
    });
});

describe('parseParamType', function () {
    it('question', function () {
        var type = doctrine.parseParamType("?");
        type.should.eql({
            type: 'NullableLiteral'
        });
    });

    it('question option', function () {
        var type = doctrine.parseParamType("?=");
        type.should.eql({
            type: 'OptionalType',
            expression: {
                type: 'NullableLiteral'
            }
        });
    });

    it('function option parameters former', function () {
        var type = doctrine.parseParamType("function(?, number)");
        type.should.eql({
            type: 'FunctionType',
            params: [{
                type: 'NullableLiteral'
            }, {
                type: 'NameExpression',
                name: 'number'
            }],
            result: null
        });
    });

    it('function option parameters latter', function () {
        var type = doctrine.parseParamType("function(number, ?)");
        type.should.eql({
            type: 'FunctionType',
            params: [{
                type: 'NameExpression',
                name: 'number'
            }, {
                type: 'NullableLiteral'
            }],
            result: null
        });
    });

    it('function type union', function () {
        var type = doctrine.parseParamType("function(): ?|number");
        type.should.eql({
            type: 'UnionType',
            elements: [{
                type: 'FunctionType',
                params: [],
                result: {
                    type: 'NullableLiteral'
                }
            }, {
                type: 'NameExpression',
                name: 'number'
            }]
        });
    });
});

describe('invalid', function () {
    it('empty union pipe', function () {
        doctrine.parseType.bind(doctrine, "(|)").should.throw();
        doctrine.parseType.bind(doctrine, "(string|)").should.throw();
        doctrine.parseType.bind(doctrine, "(string||)").should.throw();
    });

    it('comma only array type', function () {
        doctrine.parseType.bind(doctrine, "[,]").should.throw();
    });

    it('comma only record type', function () {
        doctrine.parseType.bind(doctrine, "{,,}").should.throw();
    });
});

describe('tags option', function() {
	it ('only param', function() {
        var res = doctrine.parse(
            [
                "/**",
                " * @const @const",
                " * @param {String} y",
                " */"
            ].join('\n'), { tags: ['param'], unwrap:true });
        res.tags.should.have.length(1);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'y');
     });

	it ('param and type', function() {
        var res = doctrine.parse(
            [
                "/**",
                " * @const x",
                " * @param {String} y",
                " * @type {String} ",
                " */"
            ].join('\n'), { tags: ['param', 'type'], unwrap:true });
        res.tags.should.have.length(2);
        res.tags[0].should.have.property('title', 'param');
        res.tags[0].should.have.property('name', 'y');
        res.tags[1].should.have.property('title', 'type');
        res.tags[1].should.have.property('type');
        res.tags[1].type.should.have.property('name', 'String');
     });

});

describe('invalid tags', function() {
	it ('bad tag 1', function() {
        doctrine.parse.bind(doctrine,
            [
                "/**",
                " * @param {String} hucairz",
                " */"
            ].join('\n'), { tags: 1, unwrap:true }).should.throw();
     });

	it ('bad tag 2', function() {
        doctrine.parse.bind(doctrine,
            [
                "/**",
                " * @param {String} hucairz",
                " */"
            ].join('\n'), { tags: ['a', 1], unwrap:true }).should.throw();
     });
});

describe('optional params', function() {

    // should fail since sloppy option not set
    it('failure 0', function() {
        doctrine.parse(
        ["/**", " * @param {String} [val]", " */"].join('\n'), {
            unwrap: true
        }).should.eql({
            "description": "",
            "tags": []
        });
    });
    it('success 1', function() {
        doctrine.parse(
        ["/**", " * @param {String} [val]", " */"].join('\n'), {
            unwrap: true, sloppy: true
        }).should.eql({
            "description": "",
            "tags": [{
                "title": "param",
                "description": null,
                "type": {
                    "type": "OptionalType",
                    "expression": {
                        "type": "NameExpression",
                        "name": "String"
                    }
                },
                "name": "val"
            }]
        });
    });
    it('success 2', function() {
        doctrine.parse(
        ["/**", " * @param {String=} val", " */"].join('\n'), {
            unwrap: true, sloppy: true
        }).should.eql({
            "description": "",
            "tags": [{
                "title": "param",
                "description": null,
                "type": {
                    "type": "OptionalType",
                    "expression": {
                        "type": "NameExpression",
                        "name": "String"
                    }
                },
                "name": "val"
            }]
        });
    });

    it('success 3', function() {
        doctrine.parse(
            ["/**", " * @param {String=} [val=abc] some description", " */"].join('\n'),
            { unwrap: true, sloppy: true}
        ).should.eql({
            "description": "",
            "tags": [{
                "title": "param",
                "description": "some description",
                "type": {
                    "type": "OptionalType",
                    "expression": {
                        "type": "NameExpression",
                        "name": "String"
                    }
                },
                "name": "val",
                "default": "abc"
            }]
        });
    });
});

describe('recovery tests', function() {
	it ('not recoverable', function () {
		var res = doctrine.parse(
            [
                "@param f"
            ].join('\n'), { recoverable: false });

         // parser will mistakenly think that the type is 'f' and there is no name
         res.tags.should.have.length(0);
	});

	it ('params 1', function () {
		var res = doctrine.parse(
            [
                "@param f"
            ].join('\n'), { recoverable: true });

         // parser will mistakenly think that the type is 'f' and there is no name
         res.tags.should.have.length(1);
         res.tags[0].should.have.property('title', 'param');
         res.tags[0].should.have.property('type');
         res.tags[0].type.should.have.property('name', 'f');
         res.tags[0].type.should.have.property('type', 'NameExpression');
         res.tags[0].should.not.have.property('name');
	});
	it ('params 2', function () {
		var res = doctrine.parse(
            [
                "@param f",
                "@param {string} f2"
            ].join('\n'), { recoverable: true });

         // ensure second parameter is OK
         res.tags.should.have.length(2);
         res.tags[0].should.have.property('title', 'param');
         res.tags[0].should.have.property('type');
         res.tags[0].type.should.have.property('name', 'f');
         res.tags[0].type.should.have.property('type', 'NameExpression');
         res.tags[0].should.not.have.property('name');

         res.tags[1].should.have.property('title', 'param');
         res.tags[1].should.have.property('type');
         res.tags[1].type.should.have.property('name', 'string');
         res.tags[1].type.should.have.property('type', 'NameExpression');
         res.tags[1].should.have.property('name', 'f2');
	});

	it ('params 2', function () {
		var res = doctrine.parse(
            [
                "@param string f",
                "@param {string} f2"
            ].join('\n'), { recoverable: true });

         // ensure first parameter is OK even with invalid type name
         res.tags.should.have.length(2);
         res.tags[0].should.have.property('title', 'param');
         res.tags[0].should.have.property('type');
         res.tags[0].type.should.have.property('name', 'string');
         res.tags[0].type.should.have.property('type', 'NameExpression');
         res.tags[0].should.have.property('name', 'f');

         res.tags[1].should.have.property('title', 'param');
         res.tags[1].should.have.property('type');
         res.tags[1].type.should.have.property('name', 'string');
         res.tags[1].type.should.have.property('type', 'NameExpression');
         res.tags[1].should.have.property('name', 'f2');
	});

	it ('return 1', function() {
		var res = doctrine.parse(
            [
                "@returns"
            ].join('\n'), { recoverable: true });

         // return tag should exist
         res.tags.should.have.length(1);
         res.tags[0].should.have.property('title', 'returns');
         res.tags[0].should.not.have.property('type');
	});
	it ('return 2', function() {
		var res = doctrine.parse(
            [
                "@returns",
				"@param {string} f2"
            ].join('\n'), { recoverable: true });

         // return tag should exist as well as next tag
         res.tags.should.have.length(2);
         res.tags[0].should.have.property('title', 'returns');
         res.tags[0].should.not.have.property('type');

         res.tags[1].should.have.property('title', 'param');
         res.tags[1].should.have.property('type');
         res.tags[1].type.should.have.property('name', 'string');
         res.tags[1].type.should.have.property('type', 'NameExpression');
         res.tags[1].should.have.property('name', 'f2');
	});

	it ('extra @ 1', function() {
		var res = doctrine.parse(
            [
                "@",
                "@returns",
				"@param {string} f2"
            ].join('\n'), { recoverable: true });

         // empty tag name shouldn't affect subsequent tags
         res.tags.should.have.length(3);
         res.tags[0].should.have.property('title', '');
         res.tags[0].should.not.have.property('type');

         res.tags[1].should.have.property('title', 'returns');
         res.tags[1].should.not.have.property('type');

         res.tags[2].should.have.property('title', 'param');
         res.tags[2].should.have.property('type');
         res.tags[2].type.should.have.property('name', 'string');
         res.tags[2].type.should.have.property('type', 'NameExpression');
         res.tags[2].should.have.property('name', 'f2');
	});

	it ('extra @ 2', function() {
		var res = doctrine.parse(
            [
                "@ invalid name",
				"@param {string} f2"
            ].join('\n'), { recoverable: true });

         // empty tag name shouldn't affect subsequent tags
         res.tags.should.have.length(2);
         res.tags[0].should.have.property('title', '');
         res.tags[0].should.not.have.property('type');
         res.tags[0].should.not.have.property('name');
         res.tags[0].should.have.property('description', 'invalid name');

         res.tags[1].should.have.property('title', 'param');
         res.tags[1].should.have.property('type');
         res.tags[1].type.should.have.property('name', 'string');
         res.tags[1].type.should.have.property('type', 'NameExpression');
         res.tags[1].should.have.property('name', 'f2');
	});

	it ('invalid tag 1', function() {
		var res = doctrine.parse(
            [
                "@111 invalid name",
				"@param {string} f2"
            ].join('\n'), { recoverable: true });

         // invalid tag name shouldn't affect subsequent tags
         res.tags.should.have.length(2);
         res.tags[0].should.have.property('title', '111');
         res.tags[0].should.not.have.property('type');
         res.tags[0].should.not.have.property('name');
         res.tags[0].should.have.property('description', 'invalid name');

         res.tags[1].should.have.property('title', 'param');
         res.tags[1].should.have.property('type');
         res.tags[1].type.should.have.property('name', 'string');
         res.tags[1].type.should.have.property('type', 'NameExpression');
         res.tags[1].should.have.property('name', 'f2');
	});

	it ('invalid tag 1', function() {
		var res = doctrine.parse(
            [
                "@111",
				"@param {string} f2"
            ].join('\n'), { recoverable: true });

         // invalid tag name shouldn't affect subsequent tags
         res.tags.should.have.length(2);
         res.tags[0].should.have.property('title', '111');
         res.tags[0].should.not.have.property('type');
         res.tags[0].should.not.have.property('name');
         res.tags[0].should.have.property('description', null);

         res.tags[1].should.have.property('title', 'param');
         res.tags[1].should.have.property('type');
         res.tags[1].type.should.have.property('name', 'string');
         res.tags[1].type.should.have.property('type', 'NameExpression');
         res.tags[1].should.have.property('name', 'f2');
	});

});

describe('exported Syntax', function() {
	it ('members', function () {
        doctrine.Syntax.should.eql({
            NullableLiteral: 'NullableLiteral',
            AllLiteral: 'AllLiteral',
            NullLiteral: 'NullLiteral',
            UndefinedLiteral: 'UndefinedLiteral',
            VoidLiteral: 'VoidLiteral',
            UnionType: 'UnionType',
            ArrayType: 'ArrayType',
            RecordType: 'RecordType',
            FieldType: 'FieldType',
            FunctionType: 'FunctionType',
            ParameterType: 'ParameterType',
            RestType: 'RestType',
            NonNullableType: 'NonNullableType',
            OptionalType: 'OptionalType',
            NullableType: 'NullableType',
            NameExpression: 'NameExpression',
            TypeApplication: 'TypeApplication'
        });
    });
});

describe('@ mark contained descriptions', function () {
    it ('comment description #10', function () {
        doctrine.parse(
            [
                '/**',
                ' * Prevents the default action. It is equivalent to',
                ' * {@code e.preventDefault()}, but can be used as the callback argument of',
                ' * {@link goog.events.listen} without declaring another function.',
                ' * @param {!goog.events.Event} e An event.',
                ' */'
            ].join('\n'),
            { unwrap: true, sloppy: true }).should.eql({
            'description': 'Prevents the default action. It is equivalent to\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.',
            'tags': [{
                'title': 'param',
                'description': 'An event.',
                'type': {
                    'type': 'NonNullableType',
                    'expression': {
                        'type': 'NameExpression',
                        'name': 'goog.events.Event'
                    },
                    'prefix': true
                },
                'name': 'e'
            }]
        });
    });

    it ('tag description', function () {
        doctrine.parse(
            [
                '/**',
                ' * Prevents the default action. It is equivalent to',
                ' * @param {!goog.events.Event} e An event.',
                ' * {@code e.preventDefault()}, but can be used as the callback argument of',
                ' * {@link goog.events.listen} without declaring another function.',
                ' */'
            ].join('\n'),
            { unwrap: true, sloppy: true }).should.eql({
            'description': 'Prevents the default action. It is equivalent to',
            'tags': [{
                'title': 'param',
                'description': 'An event.\n{@code e.preventDefault()}, but can be used as the callback argument of\n{@link goog.events.listen} without declaring another function.',
                'type': {
                    'type': 'NonNullableType',
                    'expression': {
                        'type': 'NameExpression',
                        'name': 'goog.events.Event'
                    },
                    'prefix': true
                },
                'name': 'e'
            }]
        });
    });
});

/* vim: set sw=4 ts=4 et tw=80 : */
