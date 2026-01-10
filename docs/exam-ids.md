# TUCaN exam ids
The internal database structure of TUCaN is opaque, especially because there is no access to the underlying CampusNet system by Datenlotsen.
All insights documented here are therefore based on observations and educated guesses rather than official documentation.

## Overview
In TUCaN, courses may have any number of associated exams. 
These exams are assigned unique identifiers, which do not seem to be deriveable from the course or module id.
Identifying these exam ids is essential for programmatically querying exam grade overviews.
It is important to note, that anyone can request a grade overview for any exam, regardless of whether they participated in it.

Grade overviews can be retrieved using the `GRADEOVERVIEW` application with the argument type `EXEV` (likely short for exam extended view).

At first glance, exam ids appear to be arbitrary 15-digit numbers with no apparent connection to other TUCaN identifiers.
A naïve brute-force approach over all 15-digit numbers each semester would be infeasible:
- it would either exceed practical timely limits or
- overload TUCaN’s servers,
neither of which is desirable.

## Observed structure
After analyzing a large collection of (exam) ids, several patterns emerge.
Their structure strongly resembles that of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).
The following characteristics can be observed:

1. Monotonically increasing over time
   Exam ids increase steadily as time progresses.
   This suggests that the ID incorporates a timestamp component.

   The epoch reference is currently unknown.
   The time unit (seconds, milliseconds, or something else) remains unclear.

   Determining this component more precisely could significantly narrow the search space.

2. The last three digits form a counter
   The final three digits behave like a monotonic overrolling sequence, increasing by one for each newly created id.
   Knowing the current sequence value allows estimating a reasonable range for the final digits of upcoming ids.

3. All observed exam ids are odd numbers
   Every collected exam id ends in 1, 3, 5, 7, or 9.
   Whether this is intentional design or coincidence is unknown, but it effectively reduces the search space by half.

## Creation Timing
Exams of a given semester tend to be created in a short time window.
While the exact duration is unknown —due to the unresolved timestamp encoding— the best guess would be that this main window is at most around one week.

It is plausible that exam creation is handled manually or semi-manually by an administrative staff member within each department at the start of each semester.

## Practical Implications
Combining the above assumptions yields a workable strategy:  
- Given a known exam id for a specific department and semester
- And knowing that other exam ids are created shortly before/after it
- And knowing the sequence and parity constraints
it becomes feasible to estimate and discover all other exam ids for that department and semester.

This logic is implemented in the `exam-id-scanner` Rust tool, which scans for "nearby" exam ids around a known reference exam and collects valid exam identifiers for further processing.
#