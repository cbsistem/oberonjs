"use strict";

var Cast = require("eberon/js/EberonCast.js");
var Context = require("context.js");
var EbContext = require("eberon/eberon_context.js");
var EberonString = require("eberon/js/EberonString.js");
var Grammar = require("grammar.js");
var Parser = require("parser.js");
var Scope = require("js/Scope.js");

var and = Parser.and;
var context = Parser.context;
var optional = Parser.optional;
var or = Parser.or;
var repeat = Parser.repeat;

function makeProcedureHeading(ident, identdef, formalParameters){
    return and("PROCEDURE",
               context(and(optional(and(ident, ".")), identdef), EbContext.ProcOrMethodId),
               context(optional(formalParameters), Context.FormalParametersProcDecl)
               );
}

function makeDesignator(qualident, selector){
    return context(
        and(or("SELF", "SUPER", qualident), repeat(selector)), EbContext.Designator);
}

function makeProcedureDeclaration(ident, procedureHeading, procedureBody){
    return context(and(procedureHeading, ";",
                       procedureBody,
                       and(ident, optional(and(".", ident)))),
                   EbContext.ProcOrMethodDecl);
}

function makeMethodHeading(identdef, formalParameters){
    return context(
        and("PROCEDURE",
            identdef,
            context(optional(formalParameters), Context.FormalParametersProcDecl)),
        EbContext.MethodHeading);
}

function makeFieldList(identdef, identList, type, formalParameters){
    return context(
        or(makeMethodHeading(identdef, formalParameters),
           and(identList, ":", type)),
        Context.FieldListDeclaration);
}

var stdSymbols = Scope.makeStdSymbols();
Scope.addSymbolForType(EberonString.string(), stdSymbols);

exports.language = {
  grammar: Grammar.make(
      makeDesignator,
      makeProcedureHeading,
      makeProcedureDeclaration,
      makeFieldList,
      EbContext.RecordDecl,
      Context.VariableDeclaration,
      EbContext.AddOperator,
      EbContext.Expression,
      Grammar.reservedWords + " SELF SUPER"
      ),
    stdSymbols: stdSymbols,
    types: {
        implicitCast: Cast.implicit
    }
};
