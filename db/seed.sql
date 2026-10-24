-- ====================================================================
-- Mood Tracker Seed Data
-- ====================================================================

-- 1. Feelings Catalog
INSERT INTO feelings (label) VALUES
    ('Grateful'),
    ('Calm'),
    ('Happy'),
    ('Energetic'),
    ('Productive'),
    ('Relaxed'),
    ('Optimistic'),
    ('Neutral'),
    ('Tired'),
    ('Bored'),
    ('Anxious'),
    ('Stressed'),
    ('Sad'),
    ('Overwhelmed'),
    ('Frustrated'),
    ('Lonely')
ON CONFLICT (label) DO NOTHING;

-- 2. Quotes by Mood Level (1 = Very Low to 5 = Very High)
INSERT INTO quotes (mood_level, text, author) VALUES
    -- Level 1: Very Low / Down
    (1, 'It is okay to not be okay. Breathe through this moment; tomorrow is a fresh canvas.', 'Unknown'),
    (1, 'Even the darkest night will pass and the sun will rise.', 'Victor Hugo'),
    (1, 'Give yourself the same gentle compassion you would give a friend in pain.', 'Kristin Neff'),
    (1, 'You do not have to control your thoughts; you just have to stop letting them control you.', 'Dan Millman'),
    
    -- Level 2: Low / Tired
    (2, 'Small steps every day still lead to great distances. Rest is not quitting.', 'Unknown'),
    (2, 'Almost everything will work again if you unplug it for a few minutes, including you.', 'Anne Lamott'),
    (2, 'Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, "I will try again tomorrow."', 'Mary Anne Radmacher'),
    (2, 'Be patient with yourself. Self-growth is tender; it is holy ground.', 'Stephen Covey'),

    -- Level 3: Neutral / Steady
    (3, 'Peace comes from within. Do not seek it without.', 'Buddha'),
    (3, 'Today is an opportunity to practice presence and appreciation for the ordinary.', 'Unknown'),
    (3, 'Notice the quiet moments of the day; often that is where calm resides.', 'Unknown'),
    (3, 'Consistency in small habits creates life-changing transformations.', 'James Clear'),

    -- Level 4: Good / Positive
    (4, 'Joy is not in things; it is in us.', 'Richard Wagner'),
    (4, 'Keep your face always toward the sunshine, and shadows will fall behind you.', 'Walt Whitman'),
    (4, 'Energy flows where attention goes. Celebrate the momentum you built today.', 'Tony Robbins'),
    (4, 'Gratitude turns what we have into enough, and more.', 'Melody Beattie'),

    -- Level 5: Great / Thriving
    (5, 'Your enthusiasm is contagious! Ride this wave of vitality and share your light.', 'Unknown'),
    (5, 'The best way to cheer yourself is to try to cheer someone else up.', 'Mark Twain'),
    (5, 'Life is either a daring adventure or nothing at all.', 'Helen Keller'),
    (5, ' radiate vitality, peace, and joy today. Treasure this feeling.', 'Unknown')
ON CONFLICT DO NOTHING;
