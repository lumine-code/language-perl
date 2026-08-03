((source_file . (comment) @keyword.control.directive.perl)
  )

[ "use" "no" "require" ] @keyword.control.import.perl

[ "if" "elsif" "unless" "else" ] @keyword.control.conditional.perl

(conditional_expression [ "?" ":" ] @keyword.control.conditional.ternary.perl)

[ "while" "until" "for" "foreach" ] @keyword.control.loop.perl
("continue" @keyword.control.loop.perl (block))

[ "try" "catch" "finally" ] @keyword.control.exception.perl

"return" @keyword.control.return.perl

[ "sub" "method" "async" "extended" ] @storage.type.function.perl

[ "map" "grep" "sort" ] @support.function.builtin.perl

[ "package" "class" "role" ] @keyword.control.import.perl

[
  "defer"
  "do" "eval"
  "my" "our" "local" "dynamically" "state" "field"
  "last" "next" "redo" "goto"
  "undef" "await"
] @keyword.control.perl

(yadayada) @keyword.control.exception.perl

(phaser_statement phase: _ @keyword.control.phaser.perl)
(class_phaser_statement phase: _ @keyword.control.phaser.perl)

(_ operator: _ @keyword.operator.perl)
"\\" @keyword.operator.perl

[
  "or" "xor" "and" "not"
  "eq" "ne" "cmp" "lt" "le" "ge" "gt"
  "isa"
] @keyword.operator.word.perl

(eof_marker) @keyword.control.directive.perl
(data_section) @comment.line.perl

(pod) @markup.other.perl

[
  (number)
  (version)
] @constant.numeric.perl

[
  (string_literal)
  (interpolated_string_literal)
  (quoted_word_list)
  (command_string)
  (heredoc_content)
  (replacement)
  (transliteration_content)
] @string.quoted.double.perl

[
  (heredoc_token)
  (command_heredoc_token)
  (heredoc_end)
] @entity.name.label.perl

[(escape_sequence) (escaped_delimiter)] @constant.character.escape.perl

(_ modifiers: _ @constant.character.escape.perl)
[
 (quoted_regexp)
 (match_regexp)
 (regexp_content)
] @string.quoted.double.regex.perl

(autoquoted_bareword) @string.other.perl

(use_statement (package) @support.type.perl)
(package_statement (package) @support.type.perl)
(class_statement (package) @support.type.perl)
(require_expression (bareword) @support.type.perl)

(subroutine_declaration_statement name: (bareword) @entity.name.function.perl)
(method_declaration_statement name: (bareword) @entity.name.function.method.perl)
(attribute_name) @entity.other.attribute-name.perl
(attribute_value) @string.quoted.double.perl

(label) @entity.name.label.perl

(statement_label label: _ @entity.name.label.perl)

(relational_expression operator: "isa" right: (bareword) @support.type.perl)

(function) @entity.name.function.perl

(function_call_expression (function) @support.other.function.perl)
(method_call_expression (method) @support.other.function.method.perl)
(method_call_expression invocant: (bareword) @support.type.perl)

(func0op_call_expression function: _ @support.function.builtin.perl)
(func1op_call_expression function: _ @support.function.builtin.perl)

([(function)(expression_statement (bareword))] @support.function.builtin.perl
 (#match? @support.function.builtin.perl
   "^(accept|atan2|bind|binmode|bless|crypt|chmod|chown|connect|die|dbmopen|exec|fcntl|flock|getpriority|getprotobynumber|gethostbyaddr|getnetbyaddr|getservbyname|getservbyport|getsockopt|glob|index|ioctl|join|kill|link|listen|mkdir|msgctl|msgget|msgrcv|msgsend|opendir|print|printf|push|pack|pipe|return|rename|rindex|read|recv|reverse|say|select|seek|semctl|semget|semop|send|setpgrp|setpriority|seekdir|setsockopt|shmctl|shmread|shmwrite|shutdown|socket|socketpair|split|sprintf|splice|substr|system|symlink|syscall|sysopen|sysseek|sysread|syswrite|tie|truncate|unlink|unpack|utime|unshift|vec|warn|waitpid|formline|open|sort)$"
))

(ERROR) @invalid.illegal.perl

(
  [(varname) (filehandle)] @variable.language.perl
  (#match? @variable.language.perl "^((ENV|ARGV|INC|ARGVOUT|SIG|STDIN|STDOUT|STDERR)|[_ab]|\\W|\\d+|\\^.*)$")
)
(filehandle (varname)) @variable.other.perl

[(array) (arraylen)] @variable.other.array.perl
(glob) @variable.language.perl
(scalar) @variable.other.scalar.perl
(hash) @variable.other.hash.perl
(amper_deref_expression [ "&" "*" ] @support.other.function.perl)

(glob_deref_expression "*" @variable.language.perl)
(glob_slot_expression "*" @variable.language.perl)
(scalar_deref_expression [ "$" "*"] @variable.other.scalar.perl)

; gotta be SUPER GENERIC so we can hit up string interp
(_
  [
   array: (_) @variable.other.array.perl
   hash: (_) @variable.other.hash.perl
  ])
(array_deref_expression [ "@" "*"] @variable.other.array.perl)
(arraylen_deref_expression [ "$#" "*"] @variable.other.array.perl)
(hash_deref_expression [ "%" "*"] @variable.other.hash.perl)
(array_element_expression array:(_) @variable.other.array.perl)
(slice_expression array:(_) @variable.other.array.perl)

(comment) @comment.line.perl

"=>" @punctuation.separator.key-value.perl
"," @punctuation.separator.comma.perl
";" @punctuation.terminator.statement.perl
"->" @punctuation.separator.method.perl

"[" @punctuation.definition.array.begin.bracket.square.perl
"]" @punctuation.definition.array.end.bracket.square.perl
"{" @punctuation.definition.block.begin.bracket.curly.perl
"}" @punctuation.definition.block.end.bracket.curly.perl
"(" @punctuation.definition.expression.begin.bracket.round.perl
")" @punctuation.definition.expression.end.bracket.round.perl

; `${name}` — braces delimiting a variable name.
(_
  "{" @punctuation.definition.variable.begin.perl
  (varname)
  "}" @punctuation.definition.variable.end.perl)

(varname
  (block
    "{" @punctuation.definition.variable.begin.perl
    "}" @punctuation.definition.variable.end.perl))

((_
    (autoquoted_bareword)
    (bareword) @constant.other.perl)
)
