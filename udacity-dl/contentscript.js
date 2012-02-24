/*
  udacity-dl - Udacity Video Downloader
  Version 0.0.1

  Written in 2012 by Greg Inozemtsev <greg@nzmsv.com>

  To the extent possible under law, the author(s) have dedicated all
  copyright and related and neighboring rights to this software to
  the public domain worldwide. This software is distributed without
  any warranty.

  You should have received a copy of the CC0 Public Domain Dedication
  along with this software. If not, see
  <http://creativecommons.org/publicdomain/zero/1.0/>.
*/

//API version
udacity_version = 'dacity-10';

//YouTube formats in order of preference
//(see http://en.wikipedia.org/wiki/YouTube#Quality_and_codecs for a description)
format_pref = ['22', '34', '18', '43'];
//TODO: Add a drop-down format selector and store preferred value in LocalStorage


function udacityAjax(request, type, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var data = JSON.parse(xhr.responseText);
				callback(data);
			} else {
				callback(null);
			}
		}
	}
	var url = 'http://www.udacity.com/ajax?' + encodeURIComponent(request);
	xhr.open('GET', url, true);
	//must include content-type header
	xhr.setRequestHeader("Content-Type", type);
	xhr.send();
};


function getUnit(data)
{
	if (data.version == udacity_version) {
		function showclass(classname)
		{
			var ids = document.getElementsByClassName(classname);
			for (var i = 0; i < ids.length; i++) {
				ids[i].removeAttribute('style');
			}
		}

		function hideclass(classname)
		{
			var ids = document.getElementsByClassName(classname);
			for (var i = 0; i < ids.length; i++) {
				ids[i].setAttribute('style', 'display:none');
			}
		}

		var directlinks = {};

		function videolist(video_map, layout)
		{
			function updateData(qs)
			{
				function parseQueryString(qs)
				{
					object = {};

					qs.split('&').map(function(part) {
						kv = part.split('=');
						object[decodeURIComponent(kv[0])] =
							decodeURIComponent(kv[1]);
					});

					return object;
				}

				fmt_map = {};
				data = parseQueryString(qs);
				fmt = data['fmt_list'];
				if (fmt) {
					fmt = fmt.split(',').map(function(a) {
						return a.split('/')[0];
					});

					streams = data['url_encoded_fmt_stream_map'].split(',')
						.map(function(a) {
							return decodeURIComponent(a.split('&')[0]
													  .split('url=')[1]);
						});

					for (var i = 0; i < fmt.length; i++) {
						fmt_map[fmt[i]] = streams[i];
					}
				}
				this.videoLinks = fmt_map;
			}

			function changeFormat(fmt)
			{
				function pad(n) {
					return ("000" + n).slice(-3);
				}

				this.removeAttribute('href');
				this.rawLink.innerText = '';
				this.rawLink.removeAttribute('href');
				if (this.videoLinks) {
					for (f in fmt) {
						if (this.videoLinks[fmt[f]]) {
							var link = this.videoLinks[fmt[f]]
								+ '&title='
								+ encodeURIComponent(pad(this.videoNumber)
													 + ' ' + this.innerText);
							this.setAttribute('href', link);
							this.rawLink.innerText = link;
							this.rawLink.setAttribute('href', link);
							break;
						}
					}
				}
			}

			var vlist = document.createElement('div');

			for (v in layout) {
				var video = layout[v];

				if (video.nugget_key) {
					video = video_map[video.nugget_key];

					if (video.media && video.media.youtube_id) {
					// or could check (video.nuggetType == 'lecture')
						var el = document.createElement('div');
						vlist.appendChild(el);
						var li = document.createElement('li');
						el.appendChild(li);

						el = document.createElement('div');
						el.setAttribute('class', 'udacity-dl-direct-link');
						li.appendChild(el);

						var el2 = document.createElement('a');
						el.appendChild(el2);

						el = document.createElement('div');
						el.setAttribute('class', 'udacity-dl-raw-link');
						li.appendChild(el);

						el2.setAttribute('style', '-webkit-user-select:text');
						el2.appendChild(document.createTextNode(video.name));
						el2.videoNumber = videolist.count++;
						el2.updateData = updateData;
						el2.changeFormat = changeFormat;
						el2.rawLink = document.createElement('a');
						el.appendChild(el2.rawLink);
						el2.rawLink.setAttribute('style', '-webkit-user-select:text;white-space:nowrap');

						directlinks[video.media.youtube_id] = el2;

						el = document.createElement('div');
						el.setAttribute('class', 'udacity-dl-youtube-id');
						var el2 = document.createElement('a');
						el2.setAttribute('style', 'margin-left:2em;-webkit-user-select:text');
						el2.setAttribute('target', '_blank');
						el2.setAttribute('href', 'http://www.youtube.com/watch?v='
										 + video.media.youtube_id);
						el.appendChild(el2);
						el2.appendChild(document.createTextNode(video.media.youtube_id));
						li.appendChild(el);
					}
				}
				else {
					vlist.appendChild(videolist(video_map, video));
				}
			}

			return vlist;
		}

		var download = document.createElement('div');

		var closeLink = document.createElement('div');
		closeLink.setAttribute('style', "float:right;cursor:pointer;height:23px;width:23px;padding:0px;background:url('http://www.udacity.com/media/img/close-button-23x23.gif');");
		download.appendChild(closeLink);

		var el = document.createElement('h1');
		el.appendChild(document.createTextNode(data.payload.course.name));
		download.appendChild(el);

		el = document.createElement('h2');
		el.appendChild(document.createTextNode(data.payload.course_rev.name));
		download.appendChild(el);

		var tools = document.createElement('div');
		tools.setAttribute('style', 'float:right;clear:both;background-color:#333;padding:5px 5px 0px 25px;border-top-left-radius:5px;');
		download.appendChild(tools);

		el = document.createElement('div');
		el.setAttribute('style', 'display:inline;margin-right:1em');
		var el2 = document.createElement('a');
		el2.setAttribute('class', 'arrow');
		el2.setAttribute('style', 'cursor:pointer');
		el2.appendChild(document.createTextNode("Direct"));
		el2.visible = true;
		el2.addEventListener('click', function () {
			if (this.visible) {
				hideclass('udacity-dl-direct-link');
				this.visible = false;
				this.setAttribute('class', 'arrow disabled');
			}
			else {
				showclass('udacity-dl-direct-link');
				this.visible = true;
				this.setAttribute('class', 'arrow');
			}
		});
		el.appendChild(el2);
		tools.appendChild(el);

		el = document.createElement('div');
		el.setAttribute('style', 'display:inline;margin-right:1em');
		el.setAttribute('class', '');
		el2 = document.createElement('a');
		el2.setAttribute('class', 'arrow disabled');
		el2.setAttribute('style', 'cursor:pointer');
		el2.appendChild(document.createTextNode("YouTube"));
		el2.addEventListener('click', function () {
			if (this.visible) {
				hideclass('udacity-dl-youtube-id');
				this.visible = false;
				this.setAttribute('class', 'arrow disabled');
			}
			else {
				showclass('udacity-dl-youtube-id');
				this.visible = true;
				this.setAttribute('class', 'arrow');
			}
		});
		el.appendChild(el2);
		tools.appendChild(el);

		el = document.createElement('div');
		el.setAttribute('style', 'display:inline;margin-right:1em');
		el.setAttribute('class', '');
		el2 = document.createElement('a');
		el2.setAttribute('class', 'arrow disabled');
		el2.setAttribute('style', 'cursor:pointer');
		el2.appendChild(document.createTextNode("Raw"));
		el2.addEventListener('click', function () {
			if (this.visible) {
				hideclass('udacity-dl-raw-link');
				this.visible = false;
				this.setAttribute('class', 'arrow disabled');
			}
			else {
				showclass('udacity-dl-raw-link');
				this.visible = true;
				this.setAttribute('class', 'arrow');
			}
		});
		el.appendChild(el2);
		tools.appendChild(el);

		var ulist = document.createElement('ul');
		download.appendChild(ulist);

		units = data.payload.course_rev.units;
		var unit_map = {};
		for (u in units) {
			unit_map[units[u].key] = units[u];
		}

		unit_layout = data.payload.course_rev.unitLayout;
		for (u in unit_layout) {
			unit = unit_map[unit_layout[u].unit_key];

			el = document.createElement('li');
			el.setAttribute('class', 'unit-header');
			el.setAttribute('style', 'cursor:default');

			el2 = document.createElement('div');
			el2.setAttribute('class', 'unit-name');
			el2.appendChild(document.createTextNode(unit.name));
			el.appendChild(el2);

			ulist.appendChild(el);

			var video_map = {};
			for (v in unit.nuggets) {
				video_map[unit.nuggets[v].key] = unit.nuggets[v];
			}

			el2 = document.createElement('ol');
			el2.setAttribute('class', 'nugget-list');
			el2.setAttribute('style', '-webkit-user-select: none');
			videolist.count = 1;
			el2.appendChild(videolist(video_map, unit.nuggetLayout));
			el.appendChild(el2);
		}


		target = document.createElement('div');
		target.setAttribute('style', 'float:right');

		openLink = document.createElement('a');
		openLink.setAttribute('class', 'button');
		openLink.appendChild(document.createTextNode("Download"));

		target.appendChild(openLink);

		download.hidden = true;
		download.setAttribute('class', 'width960');
		var content = document.getElementById('content');
		content.parentNode.insertBefore(download, content);

		hideclass('udacity-dl-youtube-id');
		hideclass('udacity-dl-raw-link');

		openLink.addEventListener('click', function () {

			function getFormats(youtube_id, a)
			{
				a.videoLinks = null;
				a.changeFormat();
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(data) {
					if (xhr.readyState == 4 && xhr.status == 200) {
						a.updateData(xhr.responseText);
						a.changeFormat(format_pref);
					}
				}
				var url = 'http://www.youtube.com/get_video_info?video_id='
					+ youtube_id;
				xhr.open('GET', url, true);
				xhr.send();
			}
			
			for (i in directlinks) {
				getFormats(i, directlinks[i]);
			}

			download.hidden = false;
			content.hidden = true;
			openLink.setAttribute('style', 'display:none');
		});

		closeLink.addEventListener('click', function () {
			download.hidden = true;
			content.hidden = false;
			openLink.removeAttribute('style');
		});

		var timeout = setTimeout(function () {
			var next = document.getElementById('nextNugget');
			if (next && next.parentNode) {
				clearTimeout(timeout);
				next.parentNode.insertBefore(target, next);
			}
		}, 300);
	}
}


if (document.querySelectorAll('#content .unit-header')) {
	udacityAjax(JSON.stringify({
		data: {
			path: document.location.hash
		},
		method: 'course.get',
		version: udacity_version
	}), "application/json;charset=utf-8", getUnit);
}
