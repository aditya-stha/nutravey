import sympy as sp
from mpmath import mp, nsum, nprod
import matplotlib.pyplot as plt

# Symbolic analysis with SymPy
# Numerical verification with Mpmath at high precision
# Visualization with Matplotlib

mp.dps = 50 # Set decimal places for high precision

# Define the summation variable
k = sp.symbols('k')

# Symbolic summation: sum of 1/k^2 (Basel problem)
symbolic_sum = sp.summation(1/k**2, (k, 1, sp.oo))

# Numerical summation with high precision
numerical_sum = nsum(lambda k: 1/k**2, (1, mp.inf))

from sympy import primerange

# Use primes up to 10,000 (~1,200 primes) for reasonable computation time
primes = list(primerange(2, 10000))
product = mp.mpf(1)

print(f"Computing product over {len(primes)} primes...")
for p in primes:
    product *= (1 / (1 - 1/(mp.mpf(p)**2)))

print(f"\nSymbolic sum: {symbolic_sum}")
print(f"Numerical sum: {numerical_sum}")
print(f"Euler product (first {len(primes)} primes): {product}")
print(f"π²/6 = {mp.pi**2/6}")
print(f"Difference: {abs(product - mp.pi**2/6)}")