$Global:CoherenceRules = @{
    # Values that are ALWAYS allowed (Strict 8pt Grid)
    AllowedSpacing = @('1', '2', '3', '4', '6', '8', '20', '36')

    Patterns = @{
        # 1. Flag standard Neutrals (The "Anti-Cheap" Rule)
        ColorBypass     = 'text-(zinc|gray|slate|stone|neutral|black|white)(?!-)'

        # 2. Flag Arbitrary (The "Anti-Magic-Number" Rule)
        ArbitraryValue  = 'className=.*\[.+?\]'

        # 3. Flag non-system text SIZES
        # Logic: Look for text- followed by common size keywords (sm, md, lg, xl, 2xl)
        # that are NOT in your luxury list.
        InvalidSize     = 'text-(?!(display-1|display-2|h1|h2|h3|h4|body|small|cta-hero|spotlight)\b)(sm|md|lg|xl|2xl|xs)\b'

        # 4. Flag non-system SPACING
        # Logic: Matches p/m/gap NOT followed by your specific scale numbers.
        InvalidSpacing  = '(?<![a-zA-Z])(p[xy]?|m[xy]?|gap)-(?!(1|2|3|4|6|8|20|36)\b)\d+'
    }
}