---
title: "K Talks"
layout: single
excerpt: 'Knowledge shared through talks, videos, podcasts, and community sessions.'
sitemap: false
author_profile: false
permalink: /k-talks/
share: false
classes: wide
---

<p class="ktalks-subtitle"><em>Knowledge shared through talks, videos, podcasts, and community sessions - because knowledge grows when it is shared, and communities grow when we learn together.</em></p>

{% assign ktalks = site.data.ktalks %}
{% assign meetup_groups = site.meetup_groups %}

<style>
  .ktalks-subtitle {
    margin-top: -0.6rem;
    margin: 0 0 1rem;
    color: #4b5563;
  }

  .ktalks-platform-icon {
    width: 0.95em;
    height: 0.95em;
    flex: 0 0 auto;
  }

  .ktalks-platform-img {
    width: 0.95em;
    height: 0.95em;
    display: block;
    border-radius: 0;
  }

  .btn--youtube {
    color: #ff0033;
  }

  .btn--youtube:hover,
  .btn--youtube:focus {
    color: #ff0033;
  }

  .btn--sessionize {
    color: #2851d8;
  }

  .btn--sessionize:hover,
  .btn--sessionize:focus {
    color: #2851d8;
  }

  .btn--upcoming {
    color: #111827;
  }

  .btn--upcoming:hover,
  .btn--upcoming:focus {
    color: #111827;
  }

  .btn--plain-link {
    color: #ff0033;
    font-weight: 700;
  }

  .btn--plain-link:hover,
  .btn--plain-link:focus {
    color: #ff0033;
    text-decoration: none;
  }

  .ktalks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .ktalks-meetup {
    margin-top: 1.5rem;
  }

  .ktalks-meetup-title {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 700;
    margin-bottom: 0.35rem;
    color: #111827;
  }

  .ktalks-meetup-title .fab {
    color: #e51937;
  }

  .ktalks-meetup-links {
    margin: 0;
    color: #6b7280;
  }

  .ktalks-meetup-links a {
    color: #111827;
    text-decoration: none;
  }

  .ktalks-meetup-links a:hover,
  .ktalks-meetup-links a:focus {
    color: #e51937;
    text-decoration: none;
  }

  .ktalks-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }

  .ktalks-card a {
    text-decoration: none;
  }

  .ktalks-thumb {
    width: 100%;
    height: auto;
    display: block;
  }

  .ktalks-title {
    padding: 0.75rem 0.9rem 1rem;
    font-weight: 600;
    line-height: 1.35;
    color: #111827;
  }
</style>

## Community Talks

{% assign community = ktalks.community_talks %}
{% if community and community.size > 0 %}
<div class="ktalks-grid">
{% for video in community %}
  {% assign card_video_id = video.youtube_id %}
  {% if card_video_id == nil or card_video_id == '' %}
    {% if video.url contains 'v=' %}
      {% assign card_video_id = video.url | split: 'v=' | last | split: '&' | first %}
    {% elsif video.url contains 'youtu.be/' %}
      {% assign card_video_id = video.url | split: 'youtu.be/' | last | split: '?' | first %}
    {% endif %}
  {% endif %}
  <article class="ktalks-card">
    <a href="{{ video.url }}" target="_blank" rel="nofollow noopener noreferrer">
      {% if card_video_id and card_video_id != '' %}
      <img class="ktalks-thumb" src="https://img.youtube.com/vi/{{ card_video_id }}/hqdefault.jpg" alt="{{ video.title }} thumbnail">
      {% endif %}
      <div class="ktalks-title">{{ video.title }}</div>
    </a>
  </article>
{% endfor %}
</div>
{% else %}
No community talks listed yet.
{% endif %}

## Bring K Talks To Your Community

If you like what you have seen and would like me to speak in your community next, or collaborate with me on your YouTube channel or podcast, reach out to me via:

<div class="action-links">
  <a class="btn btn--linkedin" href="{{ site.home_links.linkedin.url }}" target="_blank" rel="nofollow noopener noreferrer">
    <i class="fab fa-linkedin" aria-hidden="true"></i>
    LinkedIn
  </a>
  <a class="btn btn--sessionize" href="{{ site.home_links.sessionize.url }}" target="_blank" rel="nofollow noopener noreferrer">
    <img class="ktalks-platform-img" src="https://sessionize.com/favicon.ico" alt="Sessionize icon">
    Book Me On Sessionize
  </a>
  <a class="btn btn--plain-link" href="{{ ktalks.youtube_channel_url }}" target="_blank" rel="nofollow noopener noreferrer">
    <i class="fab fa-youtube" aria-hidden="true"></i>
    YouTube
  </a>
  <a class="btn btn--upcoming" href="/events/">
    <i class="fa fa-calendar-alt" aria-hidden="true"></i>
    Upcoming Talks
  </a>
</div>

<div class="ktalks-meetup">
  <div class="ktalks-meetup-title">
    <i class="fab fa-meetup" aria-hidden="true"></i>
    See me on Meetup
  </div>
  <p class="ktalks-meetup-links">I am based in Melbourne, Australia. If you are local, come say hi or join a talk I am part of.</p>
  <p class="ktalks-meetup-links">
    {% for group in meetup_groups %}
      <a href="{{ group.url }}" target="_blank" rel="nofollow noopener noreferrer">{{ group.name }}</a>{% unless forloop.last %} | {% endunless %}
    {% endfor %}
  </p>
</div>
