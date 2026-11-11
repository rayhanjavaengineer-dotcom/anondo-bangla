
/* Anondo Bangla v23 — Firebase Social Community (compat SDK)
 * Uses existing Firebase Auth; never changes local travel data or auth state.
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const state = {
    user: null,
    postsUnsub: null,
    privateUnsub: null,
    storiesUnsub: null,
    privateStoriesUnsub: null,
    busy: false,
    profileName: '',
    profilePhoto: '',
    publicCursor: null,
    publicHasMore: false,
    publicLoadingMore: false
  };

  const status = (message, kind = 'info') => {
    const el = $('abCommunityStatus');
    if (el) {
      el.textContent = message;
      el.dataset.state = kind;
    }
  };

  const escapeText = (value) => String(value == null ? '' : value);

  const initials = (value) =>
    escapeText(value || 'Traveler').trim().slice(0, 1).toUpperCase() || 'T';

  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  };

  function servicesReady() {
    return !!(
      window.firebase &&
      firebase.apps &&
      firebase.apps.length &&
      firebase.firestore &&
      firebase.storage
    );
  }

  function setSignedIn(user) {
    state.user = user || null;

    const signed = !!user;

    [
      'abCommunityProfile',
      'abCommunityComposer',
      'abStoryComposer'
    ].forEach(id => {
      const el = $(id);
      if (el) el.hidden = !signed;
    });

    const signedOut = $('abCommunitySignedOut');
    if (signedOut) signedOut.hidden = signed;

    const savedPanel = $('abCommunitySavedPanel');
    if (savedPanel) savedPanel.hidden = !signed;

    if (!signed) {
      if (state.privateUnsub) state.privateUnsub();
      state.privateUnsub = null;

      if (state.postsUnsub) state.postsUnsub();
      if (state.storiesUnsub) state.storiesUnsub();
      if (state.privateStoriesUnsub) state.privateStoriesUnsub();

      state.postsUnsub = null;
      state.storiesUnsub = null;
      state.privateStoriesUnsub = null;

      renderMessage(
        'abCommunityPrivateFeed',
        'Private পোস্ট দেখতে সাইন ইন করুন।'
      );

      renderMessage(
        'abCommunityPrivateStories',
        'Private Stories দেখতে সাইন ইন করুন।'
      );

      renderMessage(
        'abCommunitySavedPosts',
        'Saved Posts দেখতে সাইন ইন করুন।'
      );

      subscribePosts();
      subscribeStories();
      return;
    }

    loadOwnProfile();
    subscribePosts();
    subscribePrivatePosts();
    subscribeStories();
    subscribePrivateStories();
  }

  function renderMessage(id, message) {
    const el = $(id);
    if (!el) return;

    el.replaceChildren(
      make('p', 'ab-community-empty', message)
    );
  }

  function postCard(doc) {
    const data = doc.data() || {};

    const card = make('article', 'ab-community-post');
    const head = make('div', 'ab-community-post-head');

    const avatar = make(
      'span',
      'ab-community-avatar',
      initials(data.authorName)
    );

    if (data.authorPhotoURL) {
      avatar.textContent = '';

      const photo = make('img', 'ab-community-avatar-image');
      photo.src = data.authorPhotoURL;
      photo.alt = '';

      avatar.append(photo);
    }

    const who = make('div', 'ab-community-who');

    who.append(
      make('strong', '', data.authorName || 'Anondo Traveler')
    );

    who.append(
      make(
        'small',
        '',
        data.createdAt && data.createdAt.toDate
          ? data.createdAt.toDate().toLocaleString()
          : 'Recently'
      )
    );

    head.append(avatar, who);

    if (state.user && data.authorUid !== state.user.uid) {
      const follow = make(
        'button',
        'ab-community-text-button',
        'Follow'
      );

      follow.type = 'button';

      const followRef = firebase.firestore()
        .collection('users')
        .doc(state.user.uid)
        .collection('following')
        .doc(data.authorUid);

      follow.textContent = '＋ Follow';

      follow.addEventListener('click', async () => {
        follow.disabled = true;

        try {
          const snap = await followRef.get();

          if (snap.exists) {
            await followRef.delete();
            follow.textContent = '＋ Follow';
          } else {
            await followRef.set({
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            follow.textContent = 'Following';
          }
        } catch (e) {
          status('Follow পরিবর্তন করা যায়নি।', 'error');
        } finally {
          follow.disabled = false;
        }
      });

      head.append(follow);
    }

    if (state.user && data.authorUid === state.user.uid) {
      const edit = make(
        'button',
        'ab-community-text-button',
        'Edit'
      );

      edit.type = 'button';
      edit.addEventListener('click', () => editPost(doc.id, data));
      head.append(edit);

      const del = make(
        'button',
        'ab-community-text-button',
        'Delete'
      );

      del.type = 'button';
      del.addEventListener('click', () => deletePost(doc.id));
      head.append(del);

    } else if (state.user) {
      const report = make(
        'button',
        'ab-community-text-button',
        'Report'
      );

      report.type = 'button';
      report.addEventListener('click', () => reportPost(doc.id));
      head.append(report);
    }

    card.append(head);

    if (data.text) {
      card.append(make('p', 'ab-community-post-text', data.text));
    }

    if (
      data.mediaUrl &&
      String(data.mediaType || '').startsWith('image/')
    ) {
      const img = make('img', 'ab-community-media');
      img.src = data.mediaUrl;
      img.alt = 'Travel post image';
      img.loading = 'lazy';
      img.decoding = 'async';
      card.append(img);

    } else if (
      data.mediaUrl &&
      String(data.mediaType || '').startsWith('video/')
    ) {
      const video = make('video', 'ab-community-media');
      video.src = data.mediaUrl;
      video.controls = true;
      video.preload = 'metadata';
      card.append(video);
    }

    const actions = make('div', 'ab-community-actions');

    const like = make(
      'button',
      'ab-community-action',
      state.user ? '♡ Like' : '♡ Like · Sign in'
    );

    like.type = 'button';
    like.disabled = !state.user;

    const comments = make(
      'button',
      'ab-community-action',
      'Comments'
    );

    comments.type = 'button';

    const save = make(
      'button',
      'ab-community-action',
      state.user ? '🔖 Save' : '🔖 Save · Sign in'
    );

    save.type = 'button';
    save.disabled = !state.user;

    save.addEventListener('click', async () => {
      if (!state.user) return;

      save.disabled = true;

      const ref = firebase.firestore()
        .collection('users')
        .doc(state.user.uid)
        .collection('savedPosts')
        .doc(doc.id);

      try {
        const snap = await ref.get();

        if (snap.exists) {
          await ref.delete();
          save.textContent = '🔖 Save';
        } else {
          await ref.set({
            postId: doc.id,
            savedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          save.textContent = '✓ Saved';
        }

      } catch (e) {
        status('পোস্ট Save করা যায়নি।', 'error');
      } finally {
        save.disabled = false;
      }
    });

    actions.append(like, comments, save);
    card.append(actions);

    const commentArea = make('div', 'ab-community-comments');
    commentArea.hidden = true;
    card.append(commentArea);

    like.addEventListener('click', async () => {
      if (!state.user) {
        return status('Like করতে সাইন ইন করুন।', 'info');
      }

      like.disabled = true;

      const ref = firebase.firestore()
        .collection('posts')
        .doc(doc.id)
        .collection('likes')
        .doc(state.user.uid);

      try {
        const snap = await ref.get();

        if (snap.exists) {
          await ref.delete();
        } else {
          await ref.set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }

        like.textContent = snap.exists ? '♡ Like' : '♥ Liked';

      } catch (e) {
        status('Like করা যায়নি। Rules ও সংযোগ পরীক্ষা করুন।', 'error');
      } finally {
        like.disabled = false;
      }
    });

    comments.addEventListener('click', async () => {
      commentArea.hidden = !commentArea.hidden;

      if (!commentArea.hidden) {
        await loadComments(doc.id, commentArea);
      }
    });

    return card;
  }

  async function loadOwnProfile() {
    if (!state.user) return;

    const ref = firebase.firestore()
      .collection('users')
      .doc(state.user.uid);

    try {
      const snap = await ref.get();
      const d = snap.exists ? snap.data() : {};

      state.profileName =
        d.displayName ||
        state.profileName ||
        state.user.displayName ||
        'Anondo Traveler';

      state.profilePhoto =
        d.photoURL ||
        state.user.photoURL ||
        '';

      $('abCommunityProfileName').value = state.profileName;
      $('abCommunityProfileBio').value = d.bio || '';

      $('abCommunityProfileVisibility').value =
        d.profileVisibility || 'public';

      const avatarInput = $('abCommunityAvatarFile');

      if (avatarInput) avatarInput.value = '';

      if (!snap.exists) {
        await ref.set({
          uid: state.user.uid,
          displayName: state.profileName || state.user.displayName || 'Anondo Traveler',
          photoURL: state.user.photoURL || '',
          bio: '',
          profileVisibility: 'public',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

    } catch (e) {
      status(
        'প্রোফাইল লোড করা যায়নি। Firestore Rules পরীক্ষা করুন।',
        'error'
      );
    }
  }

  async function saveOwnProfile() {
    if (!state.user) return;

    const displayName = $('abCommunityProfileName').value.trim();
    const bio = $('abCommunityProfileBio').value.trim();
    const profileVisibility = $('abCommunityProfileVisibility').value;

    const avatarFile =
      $('abCommunityAvatarFile').files[0] || null;

    if (!displayName) {
      return status('প্রদর্শিত নাম লিখুন।', 'error');
    }

    try {
      if (avatarFile) {
        if (
          !avatarFile.type.startsWith('image/') ||
          avatarFile.size > 10 * 1024 * 1024
        ) {
          throw new Error(
            'Profile photo ১০ MB-এর কম JPG, PNG বা WebP হতে হবে।'
          );
        }

        const path =
          'users/' +
          state.user.uid +
          '/avatar/profile-' +
          Date.now() +
          '-' +
          avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');

        const ref = firebase.storage().ref().child(path);

        await ref.put(avatarFile, {
          contentType: avatarFile.type
        });

        state.profilePhoto = await ref.getDownloadURL();
      }

      await firebase.firestore()
        .collection('users')
        .doc(state.user.uid)
        .update({
          displayName,
          bio,
          profileVisibility,
          photoURL: state.profilePhoto || '',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      state.profileName = displayName;
      $('abCommunityAvatarFile').value = '';

      status('Traveler Profile আপডেট হয়েছে।', 'success');

    } catch (e) {
      status(
        e.message ||
        'প্রোফাইল সংরক্ষণ করা যায়নি। Rules ও Storage permission পরীক্ষা করুন।',
        'error'
      );
    }
  }

  // Public Feed: refresh status is cleared after every successful snapshot.
  function subscribePosts() {
    if (state.postsUnsub) {
      state.postsUnsub();
    }

    const feed = $('abCommunityFeed');

    state.postsUnsub = firebase.firestore()
      .collection('posts')
      .where('visibility', '==', 'public')
      .orderBy('createdAt', 'desc')
      .limit(25)
      .onSnapshot(snapshot => {

        // FIX: Clear loading status even when the feed is empty.
        status('Community Feed আপডেট হয়েছে।', 'success');

        if (!feed) return;

        feed.replaceChildren();

        if (snapshot.empty) {
          renderMessage(
            'abCommunityFeed',
            'এখনো কোনো Public travel story নেই। প্রথম পোস্টটি আপনি করতে পারেন।'
          );

          state.publicCursor = null;
          state.publicHasMore = false;

          const more = $('abCommunityLoadMore');
          if (more) more.hidden = true;

          return;
        }

        snapshot.forEach(doc => {
          feed.append(postCard(doc));
        });

        state.publicCursor = snapshot.docs.length
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

        state.publicHasMore = snapshot.size === 25;

        const more = $('abCommunityLoadMore');

        if (more) {
          more.hidden = !state.publicHasMore;
        }

      }, error => {

        renderMessage(
          'abCommunityFeed',
          'Feed লোড করা যায়নি। Firestore Rules ও প্রয়োজনীয় index পরীক্ষা করুন।'
        );

        status(
          'Community feed error: ' +
          (error.code || error.message || 'unknown'),
          'error'
        );

      });
  }

  function subscribePrivatePosts() {
    if (!state.user) return;

    if (state.privateUnsub) {
      state.privateUnsub();
    }

    const host = $('abCommunityPrivateFeed');

    state.privateUnsub = firebase.firestore()
      .collection('posts')
      .where('authorUid', '==', state.user.uid)
      .where('visibility', '==', 'private')
      .orderBy('createdAt', 'desc')
      .limit(25)
      .onSnapshot(snapshot => {

        if (!host) return;

        host.replaceChildren();

        if (snapshot.empty) {
          renderMessage(
            'abCommunityPrivateFeed',
            'আপনার কোনো Private পোস্ট নেই।'
          );
          return;
        }

        snapshot.forEach(doc => {
          host.append(postCard(doc));
        });

      }, error => {

        renderMessage(
          'abCommunityPrivateFeed',
          'Private পোস্ট লোড করা যায়নি। Firestore index/Rules পরীক্ষা করুন।'
        );

      });
  }

  function subscribeStories() {
    if (state.storiesUnsub) {
      state.storiesUnsub();
    }

    const host = $('abCommunityStories');

    state.storiesUnsub = firebase.firestore()
      .collection('stories')
      .where('visibility', '==', 'public')
      .where(
        'expiresAt',
        '>',
        firebase.firestore.Timestamp.now()
      )
      .orderBy('expiresAt')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .onSnapshot(snapshot => {

        if (!host) return;

        host.replaceChildren();

        const now = Date.now();
        let count = 0;

        snapshot.forEach(doc => {
          const d = doc.data() || {};

          const expiry =
            d.expiresAt && d.expiresAt.toDate
              ? d.expiresAt.toDate().getTime()
              : 0;

          if (expiry && expiry < now) return;

          count++;

          const item = make('article', 'ab-community-story');

          item.append(
            make('strong', '', d.authorName || 'Traveler')
          );

          if (
            d.mediaUrl &&
            String(d.mediaType || '').startsWith('image/')
          ) {
            const img = make('img');
            img.src = d.mediaUrl;
            img.alt = 'Travel story';
            img.loading = 'lazy';
            img.decoding = 'async';
            item.append(img);

          } else if (d.mediaUrl) {
            const video = make('video');
            video.src = d.mediaUrl;
            video.controls = true;
            video.preload = 'metadata';
            item.append(video);
          }

          if (d.caption) {
            item.append(make('small', '', d.caption));
          }

          host.append(item);
        });

        if (!count) {
          renderMessage(
            'abCommunityStories',
            'নতুন ২৪ ঘণ্টার Stories এখনো নেই।'
          );
        }

      }, error => {

        renderMessage(
          'abCommunityStories',
          'Stories লোড করা যায়নি।'
        );

        status('Stories error: ' + error.code, 'error');

      });
  }

  function subscribePrivateStories() {
    if (!state.user) return;

    if (state.privateStoriesUnsub) {
      state.privateStoriesUnsub();
    }

    const host = $('abCommunityPrivateStories');

    state.privateStoriesUnsub = firebase.firestore()
      .collection('stories')
      .where('authorUid', '==', state.user.uid)
      .where('visibility', '==', 'private')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {

        if (!host) return;

        host.replaceChildren();

        if (snapshot.empty) {
          return renderMessage(
            'abCommunityPrivateStories',
            'আপনার কোনো Private Story নেই।'
          );
        }

        snapshot.forEach(doc => {
          const d = doc.data() || {};

          const expiry =
            d.expiresAt && d.expiresAt.toDate
              ? d.expiresAt.toDate().getTime()
              : 0;

          if (expiry && expiry < Date.now()) return;

          const item = make('article', 'ab-community-story');

          item.append(
            make('strong', '', '🔒 ' + (d.authorName || 'You'))
          );

          if (
            d.mediaUrl &&
            String(d.mediaType || '').startsWith('image/')
          ) {
            const img = make('img');
            img.src = d.mediaUrl;
            img.alt = 'Private travel story';
            img.loading = 'lazy';
            item.append(img);

          } else if (d.mediaUrl) {
            const video = make('video');
            video.src = d.mediaUrl;
            video.controls = true;
            video.preload = 'metadata';
            item.append(video);
          }

          if (d.caption) {
            item.append(make('small', '', d.caption));
          }

          const del = make(
            'button',
            'ab-community-text-button',
            'Delete'
          );

          del.type = 'button';

          del.addEventListener('click', async () => {
            if (!confirm('Private Story মুছে ফেলবেন?')) return;

            try {
              await doc.ref.delete();

              if (d.mediaPath) {
                await firebase.storage()
                  .ref()
                  .child(d.mediaPath)
                  .delete()
                  .catch(() => {});
              }

            } catch (_) {
              status('Private Story মুছতে পারেনি।', 'error');
            }
          });

          item.append(del);
          host.append(item);
        });

      }, error => {

        renderMessage(
          'abCommunityPrivateStories',
          'Private Stories লোড করা যায়নি।'
        );

        status('Private story error: ' + error.code, 'error');

      });
  }

  async function uploadMedia(file, folder, visibility) {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      throw new Error('শুধু image অথবা video ফাইল দেওয়া যাবে।');
    }

    if (isImage && file.size > 10 * 1024 * 1024) {
      throw new Error('ছবি ১০ MB-এর কম হতে হবে।');
    }

    if (isVideo && file.size > 100 * 1024 * 1024) {
      throw new Error('ভিডিও ১০০ MB-এর কম হতে হবে।');
    }

    const safeName =
      file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-90) ||
      'upload';

    const path =
      folder +
      '/' +
      state.user.uid +
      '/' +
      visibility +
      '/' +
      Date.now() +
      '-' +
      safeName;

    const ref = firebase.storage().ref().child(path);

    await ref.put(file, {
      contentType: file.type
    });

    return {
      path,
      url: await ref.getDownloadURL(),
      type: file.type
    };
  }

  async function createPost() {
    if (!state.user || state.busy) return;

    const text = $('abCommunityPostText').value.trim();
    const file = $('abCommunityPostFile').files[0] || null;
    const visibility = $('abCommunityVisibility').value;

    if (!text && !file) {
      return status('পোস্টে লেখা অথবা ছবি/ভিডিও দিন।', 'error');
    }

    if (text.length > 5000) {
      return status('পোস্ট ৫০০০ অক্ষরের মধ্যে রাখুন।', 'error');
    }

    state.busy = true;
    $('abCommunityPublish').disabled = true;

    let uploaded = null;

    try {
      uploaded = await uploadMedia(file, 'posts', visibility);

      await firebase.firestore()
        .collection('posts')
        .add({
          authorUid: state.user.uid,
          authorName: state.profileName || state.user.displayName || 'Anondo Traveler',
          authorPhotoURL: state.profilePhoto || '',
          text,
          visibility,
          mediaPath: uploaded ? uploaded.path : '',
          mediaUrl: uploaded ? uploaded.url : '',
          mediaType: uploaded ? uploaded.type : '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      $('abCommunityPostText').value = '';
      $('abCommunityPostFile').value = '';

      status(
        visibility === 'public'
          ? 'আপনার পোস্ট Community Feed-এ প্রকাশিত হয়েছে।'
          : 'Private পোস্ট সংরক্ষিত হয়েছে।',
        'success'
      );

      if (visibility === 'private') {
        status(
          'Private পোস্ট তৈরি হয়েছে; এই ডিভাইসের Public Feed-এ এটি দেখানো হবে না।',
          'success'
        );
      }

    } catch (e) {
      status(
        e.message ||
        'পোস্ট প্রকাশ করা যায়নি। Firestore/Storage চালু আছে কি না দেখুন।',
        'error'
      );

    } finally {
      state.busy = false;
      $('abCommunityPublish').disabled = false;
    }
  }

  async function createStory() {
    if (!state.user || state.busy) return;

    const file = $('abCommunityStoryFile').files[0];

    if (!file) {
      return status('Story-এর জন্য ছবি বা ভিডিও নির্বাচন করুন।', 'error');
    }

    const caption = $('abCommunityStoryCaption').value.trim();

    state.busy = true;
    $('abCommunityStoryPublish').disabled = true;

    try {
      const visibility = $('abCommunityStoryVisibility').value;

      const uploaded = await uploadMedia(
        file,
        'stories',
        visibility
      );

      const now = firebase.firestore.Timestamp.now();

      await firebase.firestore()
        .collection('stories')
        .add({
          authorUid: state.user.uid,
          authorName: state.profileName || state.user.displayName || 'Anondo Traveler',
          authorPhotoURL: state.profilePhoto || '',
          mediaPath: uploaded.path,
          mediaUrl: uploaded.url,
          mediaType: uploaded.type,
          caption,
          visibility,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          expiresAt: firebase.firestore.Timestamp.fromMillis(
            now.toMillis() + 24 * 60 * 60 * 1000
          )
        });

      $('abCommunityStoryFile').value = '';
      $('abCommunityStoryCaption').value = '';

      status(
        visibility === 'private'
          ? 'Private Story শুধু আপনার জন্য সংরক্ষিত হয়েছে (২৪ ঘণ্টা)।'
          : 'আপনার Story ২৪ ঘণ্টার জন্য প্রকাশিত হয়েছে।',
        'success'
      );

    } catch (e) {
      status(e.message || 'Story প্রকাশ করা যায়নি।', 'error');

    } finally {
      state.busy = false;
      $('abCommunityStoryPublish').disabled = false;
    }
  }

  async function deletePost(id) {
    if (!confirm('আপনার এই পোস্টটি মুছে ফেলবেন?')) return;

    try {
      if (!firebase.functions) {
        throw new Error(
          'নিরাপদে পোস্ট ও তার comments/media মুছতে Cloud Functions deploy প্রয়োজন।'
        );
      }

      await firebase.functions()
        .httpsCallable('deleteOwnPost')({ postId: id });

      status(
        'পোস্ট ও সংশ্লিষ্ট ডেটা মুছে ফেলা হয়েছে।',
        'success'
      );

    } catch (e) {
      status(
        e.message ||
        'পোস্ট মুছতে পারেনি। Cloud Functions deploy ও permission পরীক্ষা করুন।',
        'error'
      );
    }
  }

  async function reportPost(id) {
    const reason = prompt('রিপোর্টের কারণ লিখুন:');

    if (!reason || !reason.trim()) return;

    try {
      await firebase.firestore()
        .collection('reports')
        .add({
          reporterUid: state.user.uid,
          targetType: 'post',
          targetId: id,
          reason: reason.trim().slice(0, 500),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      status('রিপোর্ট জমা হয়েছে। ধন্যবাদ।', 'success');

    } catch (e) {
      status('রিপোর্ট জমা দেওয়া যায়নি।', 'error');
    }
  }

  async function loadComments(postId, host) {
    host.replaceChildren(
      make('p', 'ab-community-empty', 'মন্তব্য লোড হচ্ছে…')
    );

    try {
      const snap = await firebase.firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .orderBy('createdAt', 'asc')
        .limit(30)
        .get();

      host.replaceChildren();

      snap.forEach(doc => {
        const d = doc.data() || {};

        const line = make('p', 'ab-community-comment');

        const b = make(
          'strong',
          '',
          d.authorName || 'Traveler'
        );

        line.append(
          b,
          document.createTextNode(' ' + (d.text || ''))
        );

        host.append(line);
      });

      if (!state.user) {
        host.append(
          make('p', 'ab-community-empty', 'মন্তব্য করতে সাইন ইন করুন।')
        );
        return;
      }

      const form = make('form', 'ab-community-comment-form');

      const input = make('input');
      input.type = 'text';
      input.maxLength = 2000;
      input.placeholder = 'মন্তব্য লিখুন…';
      input.required = true;
      input.setAttribute('aria-label', 'মন্তব্য লিখুন');

      const send = make('button', '', 'Send');
      send.type = 'submit';

      form.append(input, send);

      form.addEventListener('submit', async e => {
        e.preventDefault();

        const text = input.value.trim();

        if (!text) return;

        send.disabled = true;

        try {
          await firebase.firestore()
            .collection('posts')
            .doc(postId)
            .collection('comments')
            .add({
              authorUid: state.user.uid,
              authorName: state.profileName || state.user.displayName || 'Anondo Traveler',
              text,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

          await loadComments(postId, host);

        } catch (err) {
          status('মন্তব্য পাঠানো যায়নি।', 'error');
          send.disabled = false;
        }
      });

      host.append(form);

    } catch (e) {
      renderMessageFrom(host, 'মন্তব্য লোড করা যায়নি।');
    }
  }

  function renderMessageFrom(host, message) {
    host.replaceChildren(
      make('p', 'ab-community-empty', message)
    );
  }

  async function editPost(id, data) {
    const next = prompt(
      'আপনার পোস্ট সম্পাদনা করুন:',
      data.text || ''
    );

    if (next === null) return;

    if (!next.trim() && !data.mediaUrl) {
      return status(
        'লেখা খালি রাখা যাবে না, যদি মিডিয়াও না থাকে।',
        'error'
      );
    }

    try {
      await firebase.firestore()
        .collection('posts')
        .doc(id)
        .update({
          text: next.trim().slice(0, 5000),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      status('পোস্ট আপডেট হয়েছে।', 'success');

    } catch (e) {
      status('পোস্ট সম্পাদনা করা যায়নি।', 'error');
    }
  }

  async function loadMorePublicPosts() {
    if (
      state.publicLoadingMore ||
      !state.publicHasMore ||
      !state.publicCursor
    ) {
      return;
    }

    const button = $('abCommunityLoadMore');

    state.publicLoadingMore = true;
    button.disabled = true;
    button.textContent = 'Loading…';

    try {
      const snap = await firebase.firestore()
        .collection('posts')
        .where('visibility', '==', 'public')
        .orderBy('createdAt', 'desc')
        .startAfter(state.publicCursor)
        .limit(25)
        .get();

      snap.forEach(doc => {
        $('abCommunityFeed').append(postCard(doc));
      });

      if (snap.docs.length) {
        state.publicCursor = snap.docs[snap.docs.length - 1];
      }

      state.publicHasMore = snap.size === 25;
      button.hidden = !state.publicHasMore;

    } catch (e) {
      status('আরও পোস্ট লোড করা যায়নি।', 'error');

    } finally {
      state.publicLoadingMore = false;
      button.disabled = false;
      button.textContent = 'Load More Posts';
    }
  }

  async function loadSavedPosts() {
    if (!state.user) {
      return status('Saved Posts দেখতে সাইন ইন করুন।', 'info');
    }

    const host = $('abCommunitySavedPosts');

    host.replaceChildren(
      make('p', 'ab-community-empty', 'Saved posts লোড হচ্ছে…')
    );

    try {
      const saved = await firebase.firestore()
        .collection('users')
        .doc(state.user.uid)
        .collection('savedPosts')
        .orderBy('savedAt', 'desc')
        .limit(30)
        .get();

      host.replaceChildren();

      if (saved.empty) {
        return renderMessage(
          'abCommunitySavedPosts',
          'আপনি এখনো কোনো পোস্ট Save করেননি।'
        );
      }

      for (const item of saved.docs) {
        const post = await firebase.firestore()
          .collection('posts')
          .doc(item.id)
          .get();

        if (post.exists) {
          host.append(postCard(post));
        }
      }

      if (!host.children.length) {
        renderMessage(
          'abCommunitySavedPosts',
          'সংরক্ষিত পোস্টগুলো আর পাওয়া যাচ্ছে না।'
        );
      }

    } catch (e) {
      renderMessage(
        'abCommunitySavedPosts',
        'Saved posts লোড করা যায়নি।'
      );
    }
  }

  async function searchTravelers() {
    const term = $('abCommunityUserSearch').value.trim();
    const host = $('abCommunityUserResults');

    if (!term) {
      return renderMessage(
        'abCommunityUserResults',
        'অনুসন্ধানের জন্য নাম লিখুন।'
      );
    }

    host.replaceChildren(
      make('p', 'ab-community-empty', 'খোঁজা হচ্ছে…')
    );

    try {
      const snap = await firebase.firestore()
        .collection('users')
        .where('profileVisibility', '==', 'public')
        .orderBy('displayName')
        .startAt(term)
        .endAt(term + '\uf8ff')
        .limit(15)
        .get();

      host.replaceChildren();

      if (snap.empty) {
        return renderMessage(
          'abCommunityUserResults',
          'কোনো Public Traveler পাওয়া যায়নি।'
        );
      }

      snap.forEach(doc => {
        const d = doc.data() || {};

        if (state.user && doc.id === state.user.uid) return;

        const row = make('div', 'ab-community-user-row');

        const name = make(
          'strong',
          '',
          d.displayName || 'Traveler'
        );

        const bio = make('small', '', d.bio || '');

        row.append(name, bio);

        if (state.user) {
          const follow = make(
            'button',
            'ab-community-text-button',
            '＋ Follow'
          );

          follow.type = 'button';

          follow.addEventListener('click', async () => {
            follow.disabled = true;

            const ref = firebase.firestore()
              .collection('users')
              .doc(state.user.uid)
              .collection('following')
              .doc(doc.id);

            try {
              const old = await ref.get();

              if (old.exists) {
                await ref.delete();
                follow.textContent = '＋ Follow';
              } else {
                await ref.set({
                  createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                follow.textContent = 'Following';
              }

            } catch (_) {
              status('Follow করা যায়নি।', 'error');

            } finally {
              follow.disabled = false;
            }
          });

          row.append(follow);
        }

        host.append(row);
      });

    } catch (e) {
      renderMessage(
        'abCommunityUserResults',
        'Traveler search চালু হয়নি। Firestore index/Rules পরীক্ষা করুন।'
      );
    }
  }

  async function loadModerationQueue() {
    const host = $('abCommunityReports');

    if (!host) return;

    try {
      const snap = await firebase.firestore()
        .collection('reports')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      host.replaceChildren();

      if (snap.empty) {
        return renderMessage(
          'abCommunityReports',
          'নতুন কোনো রিপোর্ট নেই।'
        );
      }

      snap.forEach(doc => {
        const d = doc.data() || {};

        const row = make('article', 'ab-community-post');

        row.append(
          make('strong', '', 'Report: ' + (d.targetType || 'post'))
        );

        row.append(
          make(
            'p',
            '',
            'Target: ' + (d.targetId || '') + ' · ' + (d.reason || '')
          )
        );

        const actions = make('div', 'ab-community-actions');

        const dismiss = make(
          'button',
          'ab-community-action',
          'Dismiss'
        );

        dismiss.type = 'button';

        dismiss.addEventListener('click', async () => {
          dismiss.disabled = true;

          try {
            await doc.ref.delete();
            row.remove();

          } catch (_) {
            dismiss.disabled = false;
            status('রিপোর্ট সরানো যায়নি।', 'error');
          }
        });

        const remove = make(
          'button',
          'ab-community-action',
          'Remove Post'
        );

        remove.type = 'button';

        remove.addEventListener('click', async () => {
          if (!confirm('এই পোস্টটি মুছে ফেলবেন?')) return;

          remove.disabled = true;

          try {
            if (d.targetType === 'post') {
              if (!firebase.functions) {
                throw new Error('Functions SDK unavailable');
              }

              await firebase.functions()
                .httpsCallable('moderateRemovePost')({
                  postId: d.targetId
                });
            }

            await doc.ref.delete();
            row.remove();

            status('Moderation action সম্পন্ন হয়েছে।', 'success');

          } catch (_) {
            remove.disabled = false;
            status('Moderation action ব্যর্থ।', 'error');
          }
        });

        actions.append(dismiss, remove);
        row.append(actions);
        host.append(row);
      });

    } catch (e) {
      renderMessage(
        'abCommunityReports',
        'Moderation queue লোড হয়নি। Admin claim ও Rules পরীক্ষা করুন।'
      );
    }
  }

  async function refreshCreatorAnalytics() {
    const output = $('abCreatorAnalyticsStatus');

    if (!firebase.functions) {
      if (output) {
        output.textContent = 'Firebase Functions SDK পাওয়া যায়নি।';
      }
      return;
    }

    try {
      const result = await firebase.functions()
        .httpsCallable('getCreatorAnalytics')();

      const data = result.data || {};
      const totals = data.totals || {};
      const activity = data.activity || {};

      const values = {
        abMetricRegistrations: totals.registrations,
        abMetricPosts: totals.posts,
        abMetricStories: totals.stories,
        abMetricReports: totals.reports,
        abMetricDau: activity.dau,
        abMetricReturning: activity.returningUsers,
        abMetricWau: activity.wau,
        abMetricMau: activity.mau
      };

      const renderRank = (id, rows) => {
        const el = $(id);

        if (!el) return;

        el.replaceChildren();

        (rows || []).forEach(item => {
          const li = make(
            'li',
            '',
            item.name + ' · ' + item.count
          );

          el.append(li);
        });

        if (!el.children.length) {
          el.append(make('li', '', 'No tracked data yet'));
        }
      };

      renderRank(
        'abMetricPopularDestinations',
        data.popularDestinations
      );

      renderRank(
        'abMetricPopularFeatures',
        data.popularFeatures
      );

      Object.keys(values).forEach(id => {
        const el = $(id);

        if (el) {
          el.textContent = String(
            values[id] == null ? 0 : values[id]
          );
        }
      });

      if (output) {
        output.textContent = 'সর্বশেষ ৩০ দিনের সারাংশ লোড হয়েছে।';
      }

    } catch (e) {
      if (output) {
        output.textContent =
          'Analytics লোড হয়নি: ' +
          (e.code || 'unknown') +
          ' — Functions deploy ও admin claim পরীক্ষা করুন।';
      }
    }
  }

  async function checkAdminAndTrack(user) {
    try {
      if (firebase.functions) {
        firebase.functions()
          .httpsCallable('trackUserActivity')()
          .catch(() => {});
      }

      const token = await user.getIdTokenResult();

      const panel = $('abCreatorAnalytics');

      const admin = !!(
        token.claims &&
        token.claims.admin === true
      );

      if (panel) panel.hidden = !admin;

      const moderation = $('abCommunityModeration');

      if (moderation) moderation.hidden = !admin;

      if (admin) {
        refreshCreatorAnalytics();
        loadModerationQueue();
      }

    } catch (_) {
      const panel = $('abCreatorAnalytics');

      if (panel) panel.hidden = true;
    }
  }

  function init() {
    const root = $('abCommunitySection');

    if (!root) return;

    if (!servicesReady()) {
      status(
        'Firebase Firestore/Storage SDK প্রস্তুত নয়। Firebase project ও network পরীক্ষা করুন।',
        'setup'
      );
      return;
    }

    try {
      firebase.auth().onAuthStateChanged(user => {
        setSignedIn(user);

        if (user) {
          checkAdminAndTrack(user);

        } else {
          const panel = $('abCreatorAnalytics');

          if (panel) panel.hidden = true;

          const moderation = $('abCommunityModeration');

          if (moderation) {
            moderation.hidden = true;

            renderMessage(
              'abCommunityReports',
              'Admin access প্রয়োজন।'
            );
          }
        }
      });

    } catch (e) {
      status('Firebase Authentication পাওয়া যায়নি।', 'error');
    }

    $('abCommunityPublish').addEventListener(
      'click',
      createPost
    );

    $('abCommunityProfileSave').addEventListener(
      'click',
      saveOwnProfile
    );

    $('abCreatorAnalyticsRefresh').addEventListener(
      'click',
      refreshCreatorAnalytics
    );

    $('abCommunityStoryPublish').addEventListener(
      'click',
      createStory
    );

    // FIX: Set loading status BEFORE restarting listeners.
    $('abCommunityRefresh').addEventListener('click', () => {

      if (!state.user) {
        return status(
          'Feed refresh করতে সাইন ইন করুন।',
          'info'
        );
      }

      status('Feed refresh করা হচ্ছে…', 'info');

      subscribePosts();
      subscribePrivatePosts();
      subscribeStories();
      subscribePrivateStories();

    });

    $('abCommunityUserSearchButton').addEventListener(
      'click',
      searchTravelers
    );

    $('abCommunitySavedToggle').addEventListener(
      'click',
      loadSavedPosts
    );

    $('abCommunityLoadMore').addEventListener(
      'click',
      loadMorePublicPosts
    );

    $('abCommunityUserSearch').addEventListener(
      'keydown',
      e => {
        if (e.key === 'Enter') {
          searchTravelers();
        }
      }
    );

    if ($('abCommunitySavedPanel')) {
      $('abCommunitySavedPanel').hidden = !state.user;
    }
  }

  window.AnondoAnalytics = {
    track: function(type, name) {
      try {
        if (state.user && firebase.functions) {
          firebase.functions()
            .httpsCallable('trackUserActivity')({
              eventType: type,
              eventName: name
            })
            .catch(() => {});
        }
      } catch (_) {}
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
