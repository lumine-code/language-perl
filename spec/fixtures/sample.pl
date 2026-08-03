#!/usr/bin/env perl
# A Perl sample, kept idiomatic so it is worth opening in the editor.

use strict;
use warnings;
use feature qw(say);

use constant MAX => 100;

my $name    = 'world';
my @numbers = (1, 2, 3, 5, 8);
my %config  = (host => 'localhost', port => 8080);

say "Hello, $name! There are ${\ scalar @numbers } numbers.";

sub total {
    my ($self, @values) = @_;
    my $sum = 0;
    $sum += $_ for @values;
    return $sum;
}

foreach my $n (@numbers) {
    next if $n % 2 == 0;
    last if $n > MAX;
    printf("odd: %d\n", $n);
}

while (my ($key, $value) = each %config) {
    print "$key=$value\n";
}

if ($name =~ /^w(or)ld$/) {
    say "matched: $1";
} elsif ($name ne q{}) {
    say 'not empty';
} else {
    say 'empty';
}

(my $copy = $name) =~ s/world/perl/g;

my $heredoc = <<"END";
Interpolated: $name
END

my $literal = <<'END';
Not interpolated: $name
END

open(my $fh, '<', '/dev/null') or die "cannot open: $!";
close $fh;

package Sample;

sub new {
    my ($class, %args) = @_;
    return bless { %args }, $class;
}

1;

__END__

=head1 NAME

Sample - POD trails the code.

=cut
