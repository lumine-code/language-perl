(package_statement name: (package) @name) @definition.module
(class_statement name: (package) @name) @definition.class
(subroutine_declaration_statement name: (bareword) @name) @definition.function
(method_declaration_statement name: (bareword) @name) @definition.method
(variable_declaration variable: [(scalar) (array) (hash)] @name) @definition.variable
