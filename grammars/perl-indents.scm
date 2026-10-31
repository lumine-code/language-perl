; Preserve a recovered literal opener without suppressing unrelated ERRORs.
; An opening quote operator may own unnamed payload through the error range.
((ERROR . (ERROR ["q" "qq" "qr"])) @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

((ERROR) @match.next
  (#match? @match.next "^[\"']$")
  (#set! indent.match startPosition))
(ERROR ["q" "qq" "qr"] @match.next
  (#set! indent.match startPosition))
(ERROR (ERROR ["q" "qq" "qr"]) ["(" ")" "[" "]" "{" "}"] @match.next
  (#set! indent.match startPosition))

; Reindent changes code structure, never the contents of multiline literals
; or the alignment a user chose inside a block comment.
([(string_literal) (interpolated_string_literal) (command_string) (regexp_content) (heredoc_content) (comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

; Only explicit delimiters change the inherited indentation. Layout,
; operators and unfinished expressions deliberately keep the current level.
; Braces around a scalar name are not a statement or collection body.
(scalar ["{" "}"] @_IGNORE_ (#set! capture.final true))

["(" "[" "{"] @indent
[")" "]" "}"] @dedent
