---
layout: post.njk
title: Importance Sampling
description: "The maths behind importance sampling. WIP, just testing the site out."
eleventyNavigation:
  key: importancesampling
  title: Importance Sampling
  parent: rtiow
  order: 0
---

## Monte Carlo Variance

- Variance of Monte Carlo = $Var(\hat{I})$ where $\hat{I}$ is the estimator of $\int_a^b f(x)dx$ which we want to calculate.

- As variance increases, we need more simulations to achieve an accurate result.

- So we need an estimator with low variance. This means more accuracy and less noise with the same sample size.

### Variance Using a Uniform Distribution

Normally, we just use an $\hat{I}$ with a uniform distribution:
$$\hat{I} = \frac{b-a}{N} \sum_{i=1}^N f(x_i)$$

- Where $I = {E[f(x)]} \cdot (b-a)$

- Where $E[f(x)]$ is just the exact average of the function over $[a,b]$

- We estimate that average using the previous sum.

- Now we need to check this estimator's variance, so we calculate $\text{Var}(\hat{I})$.

- Note: $Var(cf(x)) = c^2 \cdot Var(f(x))$

$$\text{Var}(\hat{I}) = \frac{(b-a)^2}{N^2} \cdot \text{Var}\left(\sum_{i=1}^N f(x_i)\right)$$

- Since the samples are independent:

$$= \frac{(b-a)^2}{N^2} \cdot N \cdot \text{Var}(f(x))$$

$$= \frac{(b-a)^2}{N} \cdot \text{Var}(f(x))$$

- Our goal is to get a lower variance to achieve less noise with the same number of samples.

## Importance Sampling

- Let's start from scratch. Our original goal was:

$$\int_a^b f(x)dx$$

- We used the average last time to estimate it. We can try another method by starting here:

$$\int_a^b \frac{f(x)}{p(x)} \cdot p(x)dx$$

- By **LOTUS** (Law of the Unconscious Statistician), that equals $E_p\left[\dfrac{f(x)}{p(x)}\right]$ for any valid $p(x)$ over $[a,b]$.

- For $p(x)$ to be valid, the following conditions must be true:
  1.  $p(x) = 0 \implies f(x) = 0$ (to make sure we don't miss nonzero values)
  2.  $\int_a^b p(x)dx = 1$

- We can then just estimate that expected value via Monte Carlo.

- That's done by sampling $x$ from $p$, and getting the average of $\dfrac{f(x)}{p(x)}$

- So the estimator $\hat{I}$ becomes:

$$\hat{I} = \frac{1}{N} \sum_{i=1}^N \frac{f(x_i)}{p(x_i)}$$

- This sample mean is an unbiased estimator of the true expectation, which is just the integral.

- So, now, once more, we have an estimator for the integral we're trying to solve. How's this one different?

- It's all about the variance:

$$Var(\hat{I}) = \frac{1}{N^2} \cdot N \cdot \text{Var}\left(\frac{f(x)}{p(x)}\right)$$

$$= \frac{1}{N} \cdot \text{Var}\left(\frac{f(x)}{p(x)}\right)$$

- This variance can be way less than that of the uniform's if $p$ is chosen correctly, so it allows us to calculate the same integral faster with less noise.

- ANY probability distribution can work here as long as its PDF satisfies the two conditions stated earlier.

- So the choice of $p$ doesn't affect correctness, it only affects efficiency by minimizing variance.

- So the real question is: how to pick the best $p$?

### Minimizing Variance by Picking the Right $p$

- Let's break $\text{Var}\left(\dfrac{f(x)}{p(x)}\right)$ down using expectation:

$$\text{Var}\left(\frac{f(x)}{p(x)}\right) = E\left[\left(\frac{f(x)}{p(x)}\right)^2\right] - \left(E\left[\frac{f(x)}{p(x)}\right]\right)^2$$

- As stated earlier:

$$E\left[\dfrac{f(x)}{p(x)}\right] = I$$

- And by **LOTUS**:

$$E\left[\left(\frac{f(x)}{p(x)}\right)^2\right] = \int_a^b \frac{f(x)^2}{p(x)^2}p(x)dx = \int_a^b \frac{f(x)^2}{p(x)}dx$$

- So finally:

$$\text{Var}\left(\frac{f(x)}{p(x)}\right) = \int_a^b \frac{f(x)^2}{p(x)}dx - I^2$$

- Since $I$ is constant, we can only minimize this expression by minimizing the integral.

- Note: variance can never be negative. So the integral can at minimum equal $I^2$.

- Minimizing the integral requires using _Calculus of Variations_.

- From that minimization, we find the optimal $p$ (which we call $p^*)$:

$$p^*(x) = \dfrac{f(x)}{I}$$

- This is the valid PDF (satisfies the conditions) that minimizes the integral the most. Let's test that out:

$$\text{Var}\left(\frac{f(x)}{p(x)}\right) = \text{Var}\left(\frac{f(x)}{f(x)/I}\right) = Var(I) = 0$$

- Perfect. No variance means even one random sample will give us the actual value.

- However, obtaining $p^*$ requires knowing $I$, which is what we're trying to find in the first place.

- So, unfortunately, we can never obtain the perfect $p$.

- However, finding this theoretical minimum has provided us with useful information: the perfect probability distribution is one that resembles $f$.

- It is impossible to obtain a valid probability distribution that also happens to resemble $f$, but what we can do is find one that is _close enough_. We know what we are optimizing towards now.

- Think of it like this: when $f(x)$ resembles $p(x)$, the fraction becomes almost constant.

- The more "constant" it gets, the less variance it has, so new samples won't give you much new info, so you quickly reach the stable correct value.

### The Intuition Behind Importance Sampling

- We managed to reach the formula using LOTUS, but why does it actually work? How does that formula actually end up evaluating an integral?

- Start by thinking of an integral as an evaluation of area. We know how each term $f(x)\,dx$ is just the area of a small slice under the curve.
- This is what the original estimator did. It multiplied each sampled $f(x)$ by $\dfrac{(b-a)}{N}$, which is $dx$ as $N \rightarrow \infty$.
- When doing uniform sampling, $dx$ simply functions as a weight that tells us \*how much of the domain each $f(x)$ represents.
- We are just giving each $f(x)$ a constant weight $dx$, meaning that $x$ takes a horizontal slice on the $x$-axis of size $dx$.
- This is all well-known, but I wanted to put some emphasis on this picture.

- In importance sampling, our ultimate goal is the same: the area. However, it's reached differently. Just don't forget that area image.
- If we sample from a density function $p(x)$ and it's big at some region $[x, x + \Delta x]$ of size $\Delta x$, then we sample more in that region.
- Let's focus on that interval for a while. The probability $P$ of landing in that interval is:

$$\text{P} = p(x) \cdot \Delta x$$

- This is just the original definition of a probability density function that we often (rightfully) forget as it's rarely used in practice.
- If we sample $N$ times instead, then we have $N$ independent bernoulli trials describing whether a sample fell into $\Delta x$ or not. So it's a binomial distribution, which has a well-known expected value of $NP$.
- Then the expected value of samples falling into that region is:

$$E = NP = N \cdot p(x) \cdot \Delta x$$

- Notice how this bakes in the probability distribution $p$. So it accounts for the fact that we aren't necessarily sampling uniformly anymore.
- Remember $N$ is the total number of samples, while $E$ is the expected number of samples to actually fall in our $\Delta x$ range.

- Again, for each slice $\Delta x$, we have an area $f(x)\cdot \Delta x$.
- But we have $E$ samples on average falling in this area when following the distribution $p$, so this area is going to be counted $E$ times on average.
- To fix that, we divide the final area we get by $E$ to only count it once.

$$\text{Area Per Sample} = \frac{f(x)\cdot \Delta x}{E}$$
$$= \frac{f(x)\cdot \Delta x}{N \cdot p(x) \cdot \Delta x} = \frac{1}{N} \cdot\frac{f(x)}{p(x)}$$

- What's left is to just sum this for all $N$ samples

$$\hat{I} = \frac{1}{N}\sum_{i=1}^{N} \frac{f(x_i)}{p(x_i)}$$

- And we're done. This is the area contributed by sample, the exact same one reached via LOTUS, but reached from scratch instead, showing the intuition behind it.
- I personally can't find much semantic meaning in that final form, so I only felt satisfied when I went through that derivation, even if the "story" was destroyed through simplification.

### Relationship with Uniform Sampling

- Importance sampling is simply the general form of the crude uniform strategy we were already doing in the beginning.

- To show this, let $p(x)$ be the PDF of the uniform.

$$\hat{I} = \frac{1}{N} \sum_{i=1}^N \frac{f(x_i)}{p(x_i)}$$
$$= \frac{1}{N} \sum_{i=1}^N \frac{f(x_i)}{{1}/(b-a)}$$
$$= \frac{b-a}{N} \sum_{i=1}^N f(x_i)$$

- Which is exactly what we started with.

- Which means the variance is:

$$
\text{Var}(\hat{I}) = \frac{1}{N}\cdot\text{Var}\left(\frac{f(x)}{p(x)}\right)
= \frac{1}{N} \cdot \left[ \int_a^b \frac{f(x)^2}{1/(b-a)}dx - I^2 \right]
$$

$$= \frac{1}{N} \cdot \left[ \int_a^bf(x)^2(b-a)\,dx - I^2\right]$$

- Again, this is minimized by picking a better $p$ as explained earlier.
