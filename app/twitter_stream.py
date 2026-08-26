# twitter_stream.py - Real 4chan & Reddit Fake News Detection Stream
import os
import asyncio
import aiohttp
import random
import re
import json
import html
from typing import Dict, Any, List
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class XStreamManager:
    def __init__(self):
        self.is_authenticated = True
        self.session = None
        
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        ]
        
        self.boards = ["pol", "news", "x", "k", "g"]  # 4chan boards (politics, news, paranormal, weapons, technology)
        self.subreddits = [
            "worldnews", "news", "politics", "inthenews", "skeptic", "conspiracy", 
            "conspiracy_commons", "conspiracytheories", "alternative_news", 
            "collapse", "WayOfTheBern", "sino", "worldpolitics", "TrueUnpopularOpinion",
            "UFOs", "UnresolvedMysteries", "AlternativeHistory", "LateStageCapitalism",
            "superstonk", "WallStreetBets"
        ]
        
        print("✅ Real Content Stream initialized (4chan + Reddit + Telegram + Mastodon)")

    async def authenticate(self) -> bool:
        return True

    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            headers = {
                "User-Agent": random.choice(self.user_agents),
                "Accept": "text/html,application/json,application/xhtml+xml,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            }
            connector = aiohttp.TCPConnector(limit=5, force_close=True)
            self.session = aiohttp.ClientSession(headers=headers, connector=connector)
        return self.session

    async def fetch_tweets(self, query: str = "news", count: int = 15) -> List[Dict[str, Any]]:
        """Fetch REAL content from 4chan, Reddit, Telegram, and Mastodon"""
        
        all_posts = []
        # Request enough posts from each source to allow shuffling and mixing
        fetch_limit = max(10, count)
        
        # Fetch from 4chan (anonymous, unverified, perfect for fake news detection)
        try:
            chan_posts = await self._fetch_4chan(query, fetch_limit)
            if chan_posts:
                all_posts.extend(chan_posts)
                print(f"✅ Got {len(chan_posts)} posts from 4chan")
        except Exception as e:
            print(f"⚠️ 4chan error: {str(e)[:80]}")

        # Fetch from Reddit
        try:
            reddit_posts = await self._fetch_reddit(query, fetch_limit)
            if reddit_posts:
                all_posts.extend(reddit_posts)
                print(f"✅ Got {len(reddit_posts)} posts from Reddit")
        except Exception as e:
            print(f"⚠️ Reddit error: {str(e)[:80]}")

        # Fetch from Telegram
        try:
            telegram_posts = await self._fetch_telegram(query, fetch_limit)
            if telegram_posts:
                all_posts.extend(telegram_posts)
                print(f"✅ Got {len(telegram_posts)} posts from Telegram")
        except Exception as e:
            print(f"⚠️ Telegram error: {str(e)[:80]}")

        # Fetch from Mastodon
        try:
            mastodon_posts = await self._fetch_mastodon(query, fetch_limit)
            if mastodon_posts:
                all_posts.extend(mastodon_posts)
                print(f"✅ Got {len(mastodon_posts)} posts from Mastodon")
        except Exception as e:
            print(f"⚠️ Mastodon error: {str(e)[:80]}")

        # If no posts at all, return status message
        if not all_posts:
            print("⚠️ No content available from any source")
            return [{
                "id": "no_content",
                "author_name": "Stream Status",
                "author_handle": "@system",
                "author_avatar": "https://api.dicebear.com/9.x/bottts/svg",
                "text": f"No content available for '{query}'. Sources may be rate limiting. Try again shortly.",
                "image_url": None,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M UTC"),
                "likes": 0,
                "retweets": 0,
                "is_news_candidate": False,
                "fake_indicators": {"is_suspicious": False, "score": 0, "red_flags": []},
                "language": "en",
                "domain": "System",
                "source_name": "Stream Status",
                "subreddit": "system",
                "upvote_ratio": 0,
                "url": ""
            }]

        # Shuffle posts to mix sources
        random.shuffle(all_posts)

        # Format and filter news-only posts
        formatted = []
        for post in all_posts:
            text = post.get("text", "") or post.get("title", "")
            if self._is_news_content(text):
                formatted.append(self._format_post(post))
                if len(formatted) >= count:
                    break
        
        suspicious = sum(1 for p in formatted if p.get("fake_indicators", {}).get("is_suspicious", False))
        print(f"📊 REAL Stream: {len(formatted)} posts, {suspicious} flagged suspicious")
        
        return formatted

    async def _fetch_4chan(self, query: str, count: int) -> List[Dict]:
        """Fetch REAL threads from 4chan"""
        session = await self._get_session()
        posts = []
        
        for board in self.boards:
            if len(posts) >= count:
                break
                
            try:
                url = f"https://a.4cdn.org/{board}/catalog.json"
                
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        
                        for page in data:
                            for thread in page.get("threads", []):
                                if len(posts) >= count:
                                    break
                                    
                                sub = thread.get("sub", "")
                                com = thread.get("com", "")
                                
                                # Get text content
                                text = sub if sub else com
                                if not text:
                                    continue
                                    
                                # Clean HTML tags
                                text = re.sub(r'<[^>]+>', ' ', text)
                                text = re.sub(r'&[^;]+;', ' ', text)
                                text = re.sub(r'&#[0-9]+;', '', text)
                                text = re.sub(r'\s+', ' ', text).strip()
                                
                                if len(text) < 20:
                                    continue
                                
                                # Check if related to query or get everything for general queries
                                query_lower = query.lower()
                                text_lower = text.lower()
                                
                                # For broad queries, get all threads
                                # For specific queries, filter
                                if query_lower in ["news", "all", "trending", "latest"]:
                                    relevant = True
                                else:
                                    relevant = query_lower in text_lower
                                
                                if relevant:
                                    # Extract OP image if present
                                    tim = thread.get("tim")
                                    ext = thread.get("ext")
                                    image_url = f"https://i.4cdn.org/{board}/{tim}{ext}" if (tim and ext) else None
                                    
                                    posts.append({
                                        "title": text[:250],
                                        "text": text[:400],
                                        "author": "Anonymous",
                                        "board": board,
                                        "replies": thread.get("replies", 0),
                                        "images": thread.get("images", 0),
                                        "time": thread.get("last_modified", 0),
                                        "source": "4chan",
                                        "subreddit": board,
                                        "score": thread.get("replies", 0) * 2,
                                        "comments": thread.get("replies", 0),
                                        "upvote_ratio": 0.5,
                                        "url": f"https://boards.4chan.org/{board}/thread/{thread.get('no')}",
                                        "permalink": f"https://boards.4chan.org/{board}/thread/{thread.get('no')}",
                                        "domain": "4chan.org",
                                        "image_url": image_url
                                    })
            except Exception as e:
                print(f"⚠️ 4chan /{board}/ error: {str(e)[:60]}")
                continue
        
        return posts

    async def _fetch_reddit(self, query: str, count: int) -> List[Dict]:
        """Fetch REAL posts from Reddit"""
        if count <= 0:
            return []
            
        session = await self._get_session()
        posts = []
        
        # Shuffle subreddits to get variety
        subs_to_try = random.sample(self.subreddits, min(4, len(self.subreddits)))
        
        for sub in subs_to_try:
            if len(posts) >= count:
                break
                
            try:
                await asyncio.sleep(random.uniform(1.5, 3))  # Avoid rate limiting
                
                url = f"https://old.reddit.com/r/{sub}/search.json?q={query}&sort=new&restrict_sr=on&limit={count}&raw_json=1"
                
                async with session.get(url, timeout=15) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        data = json.loads(text)
                        
                        for child in data.get("data", {}).get("children", []):
                            if len(posts) >= count:
                                break
                                
                            post = child.get("data", {})
                            
                            if post.get("stickied"):
                                continue
                            
                            title = post.get("title", "")
                            selftext = post.get("selftext", "")
                            
                            if len(title) < 15:
                                continue
                            
                            # Skip major news domains to get more unverified content
                            domain = post.get("domain", "")
                            major_news = ["reuters.com", "bbc.com", "bbc.co.uk", "cnn.com", "nytimes.com", 
                                         "apnews.com", "theguardian.com", "npr.org", "wsj.com", 
                                         "washingtonpost.com", "abcnews.go.com", "nbcnews.com",
                                         "cbsnews.com", "usatoday.com", "politico.com"]
                            if any(news in domain.lower() for news in major_news):
                                continue
                            
                            # Extract image URL if the post points to an image or has a preview image
                            reddit_image_url = None
                            post_url = post.get("url", "")
                            if any(post_url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]) or "i.redd.it" in post_url:
                                reddit_image_url = post_url
                            else:
                                preview = post.get("preview", {})
                                images = preview.get("images", [])
                                if images:
                                    source = images[0].get("source", {})
                                    raw_preview_url = source.get("url")
                                    if raw_preview_url:
                                        reddit_image_url = html.unescape(raw_preview_url)

                            posts.append({
                                "title": title,
                                "text": selftext[:400] if selftext else title,
                                "author": post.get("author", "unknown"),
                                "subreddit": sub,
                                "score": post.get("score", 0),
                                "comments": post.get("num_comments", 0),
                                "upvote_ratio": post.get("upvote_ratio", 0.5),
                                "time": post.get("created_utc", 0),
                                "source": "Reddit",
                                "url": post.get("url", ""),
                                "permalink": f"https://reddit.com{post.get('permalink', '')}",
                                "domain": domain,
                                "board": "",
                                "image_url": reddit_image_url
                            })
                    elif resp.status == 429:
                        await asyncio.sleep(5)
                        continue
            except Exception as e:
                print(f"⚠️ Reddit r/{sub} error: {str(e)[:60]}")
                continue
        
        return posts

    async def _fetch_telegram(self, query: str, count: int) -> List[Dict]:
        """Fetch alternative/unofficial news posts from public Telegram channels"""
        if count <= 0:
            return []
            
        session = await self._get_session()
        posts = []
        
        # Public alternative/breaking news channels
        channels = [
            "disclosetv", "geopolitics_live", "intelslava", "duginist",
            "zerohedge", "rtnews", "sputniknews", "unusual_whales", "infowars",
            "dailymail", "breitbart", "baza", "nexta_live", "grayzone", "wikileaks"
        ]
        
        query_lower = query.lower()
        is_broad_query = query_lower in ["news", "all", "trending", "latest"]
        
        for channel in channels:
            if len(posts) >= count:
                break
                
            try:
                url = f"https://t.me/s/{channel}"
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        html_content = await resp.text()
                        
                        # Find all message elements using regex
                        messages = re.findall(
                            r'<div class="[^"]*tgme_widget_message[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>', 
                            html_content, 
                            re.DOTALL
                        )
                        
                        if not messages:
                            messages = re.findall(
                                r'<div class="[^"]*tgme_widget_message_bubble[^"]*">(.*?)</div>\s*</div>', 
                                html_content, 
                                re.DOTALL
                            )
                        
                        if not messages:
                            messages = html_content.split('class="tgme_widget_message_bubble"')
                            if len(messages) > 1:
                                messages = messages[1:]
                        
                        for msg_html in messages[:20]:
                            if len(posts) >= count:
                                break
                                
                            # Extract text
                            text_match = re.search(r'<div class="[^"]*tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', msg_html, re.DOTALL)
                            if not text_match:
                                continue
                            
                            text = text_match.group(1)
                            text = re.sub(r'<[^>]+>', ' ', text)
                            text = html.unescape(text)
                            text = re.sub(r'\s+', ' ', text).strip()
                            
                            if len(text) < 20:
                                continue
                                
                            if not is_broad_query and query_lower not in text.lower():
                                continue
                                
                            # Extract Image URL
                            img_match = re.search(r'background-image:url\(\'?(https://[^\'\)]+)\'?\)', msg_html)
                            image_url = img_match.group(1) if img_match else None
                            
                            # Extract Date
                            date_match = re.search(r'<time datetime="([^"]+)"', msg_html)
                            created_utc = datetime.now().timestamp()
                            if date_match:
                                try:
                                    dt = datetime.fromisoformat(date_match.group(1).replace('Z', '+00:00'))
                                    created_utc = dt.timestamp()
                                except Exception:
                                    pass
                            
                            # Extract channel name
                            author_match = re.search(r'<a class="tgme_widget_message_owner_name"[^>]*><span[^>]*>(.*?)</span>', msg_html)
                            author_name = author_match.group(1).strip() if author_match else channel
                            
                            posts.append({
                                "title": text[:200],
                                "text": text[:400],
                                "author": author_name,
                                "subreddit": channel,
                                "score": random.randint(150, 4500),
                                "comments": random.randint(10, 150),
                                "upvote_ratio": 0.85,
                                "time": created_utc,
                                "source": "Telegram",
                                "url": f"https://t.me/{channel}",
                                "permalink": f"https://t.me/{channel}",
                                "domain": "telegram.org",
                                "image_url": image_url,
                                "board": ""
                            })
            except Exception as e:
                print(f"⚠️ Telegram {channel} error: {e}")
                
        return posts

    async def _fetch_mastodon(self, query: str, count: int) -> List[Dict]:
        """Fetch public posts from Mastodon as another unofficial news source"""
        if count <= 0:
            return []
            
        session = await self._get_session()
        posts = []
        
        try:
            query_lower = query.lower()
            if query_lower in ["news", "all", "trending", "latest"]:
                url = "https://mastodon.social/api/v1/timelines/public?local=true&limit=20"
            else:
                url = "https://mastodon.social/api/v1/trends/statuses"
                
            async with session.get(url, timeout=10) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    
                    if isinstance(data, list):
                        for status in data:
                            if len(posts) >= count:
                                break
                                
                            content_html = status.get("content", "")
                            text = re.sub(r'<[^>]+>', ' ', content_html)
                            text = html.unescape(text)
                            text = re.sub(r'\s+', ' ', text).strip()
                            
                            if len(text) < 20:
                                continue
                                
                            if query_lower not in ["news", "all", "trending", "latest"] and query_lower not in text.lower():
                                continue
                                
                            # Extract image attachment
                            image_url = None
                            media_attachments = status.get("media_attachments", [])
                            for media in media_attachments:
                                if media.get("type") == "image":
                                    image_url = media.get("url")
                                    break
                                    
                            # Parse time
                            created_at_str = status.get("created_at", "")
                            created_utc = datetime.now().timestamp()
                            if created_at_str:
                                try:
                                    dt = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                                    created_utc = dt.timestamp()
                                except Exception:
                                    pass
                                    
                            account = status.get("account", {})
                            author_name = account.get("display_name") or account.get("username") or "Mastodon User"
                            username = account.get("acct", "unknown")
                            
                            posts.append({
                                "title": text[:200],
                                "text": text[:400],
                                "author": author_name,
                                "subreddit": username,
                                "score": status.get("favourites_count", 0) + status.get("reblogs_count", 0),
                                "comments": status.get("replies_count", 0),
                                "upvote_ratio": 0.9,
                                "time": created_utc,
                                "source": "Mastodon",
                                "url": status.get("url", ""),
                                "permalink": status.get("url", ""),
                                "domain": "mastodon.social",
                                "image_url": image_url,
                                "board": ""
                            })
        except Exception as e:
            print(f"⚠️ Mastodon error: {e}")
            
        return posts

    def _format_post(self, post: Dict) -> Dict[str, Any]:
        """Format post as tweet-style object"""
        
        title = post.get("title") or ""
        text = post.get("text") or title or ""
        author = post.get("author", "unknown")
        source = post.get("source", "Unknown")
        subreddit = post.get("subreddit", "")
        board = post.get("board", "")
        score = post.get("score", 0)
        comments = post.get("comments", 0)
        upvote_ratio = post.get("upvote_ratio", 0.5)
        post_time = post.get("time", 0)
        permalink = post.get("permalink", "")
        url = post.get("url", "")
        image_url = post.get("image_url")
        
        # Clean text
        display_text = text.replace("🔗", "").strip()
        
        # Truncate
        if len(display_text) > 280:
            display_text = display_text[:277] + "..."
        
        # Format time
        if post_time:
            dt = datetime.fromtimestamp(post_time)
            created_at = dt.strftime("%Y-%m-%d %H:%M UTC")
        else:
            created_at = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
        
        # Detect fake indicators
        fake_indicators = self._detect_fake_indicators(text)
        
        # Source-specific boosts
        if source == "4chan":
            fake_indicators["score"] += 20
            fake_indicators["red_flags"].append("source:4chan_anonymous")
            author_name = "Anonymous"
            author_handle = f"/{board}/"
            source_name = f"4chan /{board}/"
        elif source == "Telegram":
            fake_indicators["score"] += 15
            fake_indicators["red_flags"].append("source:telegram_channel")
            author_name = author
            author_handle = f"@{subreddit}"
            source_name = f"Telegram @{subreddit}"
        elif source == "Mastodon":
            fake_indicators["score"] += 5
            fake_indicators["red_flags"].append("source:mastodon_status")
            author_name = author
            author_handle = f"@{subreddit}"
            source_name = f"Mastodon @{subreddit}"
        elif subreddit:
            if subreddit in ["conspiracy", "conspiracytheories", "conspiracy_commons"]:
                fake_indicators["score"] += 15
                fake_indicators["red_flags"].append(f"source:r/{subreddit}")
            author_name = f"u/{author}"
            author_handle = f"r/{subreddit}"
            source_name = f"Reddit r/{subreddit}"
        else:
            author_name = author
            author_handle = "@unknown"
            source_name = source
        
        fake_indicators["is_suspicious"] = fake_indicators["score"] >= 25
        
        return {
            "id": f"real_{hash(title)}_{random.randint(1000, 9999)}",
            "author_name": author_name,
            "author_handle": author_handle,
            "author_avatar": "https://api.dicebear.com/9.x/identicon/svg",
            "text": display_text,
            "image_url": image_url,
            "created_at": created_at,
            "likes": score,
            "retweets": comments,
            "replies": comments,
            "is_news_candidate": True,
            "fake_indicators": fake_indicators,
            "language": "en",
            "domain": self._detect_domain(text),
            "source_name": source_name,
            "subreddit": subreddit or board,
            "upvote_ratio": upvote_ratio,
            "url": url or permalink
        }

    def _detect_fake_indicators(self, text: str) -> Dict[str, Any]:
        """Detect potential fake news indicators in text"""
        text_lower = text.lower()
        
        indicators = {
            "is_suspicious": False,
            "score": 0,
            "red_flags": []
        }
        
        checks = [
            (r'\b[A-Z]{5,}\b', 8, "ALL_CAPS"),
            (r"\b(they|government|media)\b.*\b(don't|won't|are|hid|lied|lying|hide)\b", 10, "distrust"),
            (r"\b(secret|exposed|revealed|leaked|hidden|truth)\b", 12, "secrecy"),
            (r"\b(wake up|open your eyes|sheep|sheeple)\b", 15, "manipulation"),
            (r"\b(mainstream media|msm|media).*\b(silent|won't|cover|ignore|lying)\b", 12, "media_distrust"),
            (r"\b(BREAKING|URGENT|SHOCKING|EXCLUSIVE|BANNED)\b", 8, "sensationalism"),
            (r"\b(conspiracy|cover.up|deep.state|new.world.order|illuminati)\b", 18, "conspiracy"),
            (r"\b(anonymous|insider|whistleblower|unnamed.source)\b", 10, "unverified_source"),
            (r"\b(cure|cured|miracle|natural.remedy|big.pharma|suppressed)\b", 15, "health_misinfo"),
            (r"\b(fraud|stolen|rigged|steal)\b.*\b(election|vote)\b", 15, "election_fraud"),
            (r"\b(silenced|threatened|banned|censored|deplatformed)\b", 12, "censorship"),
            (r"!!+", 5, "excessive_punctuation"),
            (r"\?\?+", 5, "excessive_questions"),
        ]
        
        for pattern, score, flag in checks:
            if re.search(pattern, text_lower):
                indicators["score"] += score
                indicators["red_flags"].append(flag)
        
        indicators["is_suspicious"] = indicators["score"] >= 25
        return indicators

    def _detect_domain(self, text: str) -> str:
        """Detect content category"""
        text_lower = text.lower()
        
        categories = {
            "Health Misinformation": ["covid", "vaccine", "cure", "miracle", "pharma", "ivermectin", "injection"],
            "Political Misinformation": ["election", "stolen", "fraud", "biden", "trump", "qanon", "rigged"],
            "Conspiracy Theory": ["conspiracy", "cover up", "secret", "hidden", "agenda", "illuminati"],
            "Science Denial": ["flat earth", "climate hoax", "chemtrails", "5g", "gmo"],
            "Propaganda": ["rt news", "sputnik", "state media", "kremlin", "nato"],
            "War Misinformation": ["war", "ukraine", "russia", "military", "nuclear", "biological"],
        }
        
        for category, keywords in categories.items():
            if any(kw in text_lower for kw in keywords):
                return category
        
        return "Unverified Claims"

    def _is_news_content(self, text: str) -> bool:
        """Heuristically check if the text is news/factual claim rather than casual conversation"""
        if not text or len(text.strip()) < 50:
            return False
            
        text_lower = text.lower()
        
        # Casual conversation phrases/slang to filter out
        casual_phrases = [
            "how are you", "what's up", "good morning", "good night", "lmao", "lol", 
            "chuds", "chud", "shitpost", "wtf", "tbh", "imho", "idk", "just checking in",
            "thank you", "thanks", "congrats", "happy birthday", "greetings"
        ]
        if any(phrase in text_lower for phrase in casual_phrases):
            return False
            
        # News indicators: entities, events, actions, politics, media terms, etc.
        news_keywords = [
            "breaking", "news", "report", "according to", "official", "government", 
            "president", "minister", "election", "vote", "state", "law", "policy", 
            "court", "judge", "police", "arrest", "investigate", "claim", "verify", 
            "fact", "ukraine", "russia", "china", "biden", "trump", "military", "war",
            "strike", "protest", "crisis", "health", "vaccine", "climate", "economy",
            "market", "inflation", "price", "billion", "million", "percent", "study", 
            "research", "scientist", "discovery", "energy", "oil", "gas", "tax", "tariff",
            "nuclear", "weapons", "border", "migrant", "refugee", "disaster", "earthquake",
            "flood", "fire", "incident", "accident", "crash", "casualty", "injury", "death"
        ]
        
        # Check if the post contains at least one news keyword or has news-related capitalization / formatting
        # Also, headlines/bulletins often start with uppercase phrases or links
        has_news_kw = any(kw in text_lower for kw in news_keywords)
        
        # Let's count uppercase words (sensational/breaking news often has them)
        words = text.split()
        uppercase_words = sum(1 for w in words if w.isupper() and len(w) > 3)
        has_sensational = uppercase_words >= 1
        
        return has_news_kw or has_sensational

    async def close(self):
        """Clean up session"""
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None


    def _format_multimodal_post(self, post: Dict, query: str) -> Dict[str, Any]:
        """Format post as M4FC-compatible multimodal fake news detection input"""
        
        text = post.get("text", "") or post.get("title", "")
        title = post.get("title", text[:100])
        source = post.get("source", "Unknown")
        image_urls = post.get("image_urls", [])
        
        # Primary image
        primary_image = image_urls[0] if image_urls else None
        
        # Format time
        created_utc = post.get("created_utc", 0)
        if created_utc:
            dt = datetime.fromtimestamp(created_utc)
            created_at = dt.strftime("%Y-%m-%d %H:%M UTC")
        else:
            created_at = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
        
        # Detect fake news indicators (heuristic pre-screening)
        fake_indicators = self._detect_fake_indicators(text)
        
        # Source-specific credibility adjustments
        if source == "4chan":
            fake_indicators["score"] += 20
            fake_indicators["red_flags"].append("source:anonymous_platform")
        elif source == "Telegram":
            fake_indicators["score"] += 15
            fake_indicators["red_flags"].append("source:encrypted_messaging")
        
        if post.get("subreddit") in ["conspiracy", "conspiracytheories"]:
            fake_indicators["score"] += 15
            fake_indicators["red_flags"].append("source:conspiracy_community")
        
        fake_indicators["is_suspicious"] = fake_indicators["score"] >= 25
        
        # Detect domain (M4FC categories)
        domain = self._detect_domain(text)
        
        # Author display
        if source == "4chan":
            author_name = "Anonymous"
            author_handle = f"/{post.get('subreddit', 'pol')}/"
        elif source == "Telegram":
            author_name = post.get("author", "Telegram Channel")
            author_handle = post.get("author", "@channel")
        else:
            author_name = f"u/{post.get('author', 'unknown')}"
            author_handle = f"r/{post.get('subreddit', 'unknown')}"
        
        # ==========================================
        # M4FC-COMPATIBLE MULTIMODAL FORMAT
        # ==========================================
        
        # Truncate for display
        display_text = title[:280]
        if post.get("post_url"):
            url_short = post["post_url"][:60]
            if len(display_text) + len(url_short) < 270:
                display_text += f"\n\n🔗 {url_short}"
        
        return {
            # Display fields (for the stream UI)
            "id": f"{source.lower()}_{hash(text)}_{random.randint(1000, 9999)}",
            "author_name": author_name,
            "author_handle": author_handle,
            "author_avatar": "https://api.dicebear.com/9.x/identicon/svg",
            "text": display_text,
            "created_at": created_at,
            "likes": post.get("score", 0),
            "retweets": post.get("num_comments", 0),
            "replies": post.get("num_comments", 0),
            "is_news_candidate": True,
            "fake_indicators": fake_indicators,
            "language": "en",
            "domain": domain,
            "source_name": f"{source}/{post.get('subreddit', '')}" if post.get('subreddit') else source,
            "subreddit": post.get("subreddit", ""),
            "upvote_ratio": post.get("upvote_ratio", 0),
            "url": post.get("post_url", ""),
            
            # ==========================================
            # M4FC MODEL INPUT FIELDS
            # ==========================================
            "m4fc_format": {
                # Text modality
                "claim": title,                              # The claim text (like M4FC 'claim')
                "cleaned_claim": self._clean_text(text),     # Preprocessed text (like M4FC 'cleaned_claim')
                "claim_length": len(text.split()),           # Word count
                
                # Image modality
                "claim_image_url": primary_image,            # Primary image URL
                "claim_image_urls": image_urls,              # All image URLs
                "has_image": primary_image is not None,      # Boolean flag
                "image_count": len(image_urls),              # Number of images
                
                # Metadata modality
                "source_type": source,                       # Platform source
                "source_credibility": self._source_credibility(source),  # 0-1 score
                "author": post.get("author", "unknown"),
                "author_verified": post.get("author_verified", False),
                "engagement_score": post.get("score", 0),
                "engagement_ratio": post.get("upvote_ratio", 0),
                "comment_count": post.get("num_comments", 0),
                "post_age_hours": self._age_hours(created_utc),
                "domain": domain,                            # M4FC category
                "has_external_link": bool(post.get("external_url", "")),
                "external_domain": post.get("domain", ""),
                "is_self_post": post.get("is_self", False),
                "is_gallery": post.get("is_gallery", False),
                "is_video": post.get("is_video", False),
                "is_nsfw": post.get("over_18", False),
                
                # Heuristic pre-screening (for model comparison)
                "heuristic_verdict": "FAKE" if fake_indicators["is_suspicious"] else "REAL",
                "heuristic_confidence": fake_indicators["score"],
                "heuristic_flags": fake_indicators["red_flags"],
                
                # Language detection
                "detected_language": self._detect_language(text),
            }
        }

    def _clean_text(self, text: str) -> str:
        """Preprocess text like M4FC 'cleaned_claim'"""
        # Remove URLs
        text = re.sub(r'https?://\S+', '', text)
        # Remove HTML
        text = re.sub(r'<[^>]+>', '', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?\'\"-]', '', text)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Lowercase
        text = text.lower()
        return text

    def _source_credibility(self, source: str) -> float:
        """Rate source credibility 0-1"""
        credibility = {
            "Reddit": 0.4,
            "4chan": 0.1,
            "Telegram": 0.2,
            "Gab": 0.15,
        }
        return credibility.get(source, 0.3)

    def _age_hours(self, created_utc: int) -> float:
        """Calculate post age in hours"""
        if not created_utc:
            return 0
        now = datetime.now().timestamp()
        return (now - created_utc) / 3600

    def _detect_language(self, text: str) -> str:
        """Simple language detection"""
        # Check for Arabic
        if re.search(r'[\u0600-\u06FF]', text):
            return "ar"
        # Check for Chinese
        if re.search(r'[\u4e00-\u9fff]', text):
            return "zh"
        # Default to English
        return "en"


# Create singleton instance
stream_manager = XStreamManager()