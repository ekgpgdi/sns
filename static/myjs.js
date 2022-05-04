function toggle_like(post_id, type) {
    console.log(post_id, type)
    // 아이디를 가지고 있고 aria-label 이 heart 인 a 태그를 찾음
    let $a_like = $(`#${post_id} a[aria-label='${type}']`)
    // 그 a 태그 밑의 i 태그를 찾음
    let $i_like = $a_like.find("i")
    let fill_icon = ''
    let unfill_icon = ''
    let action = ''
    if (type === 'heart') {
        fill_icon = 'fa-heart'
        unfill_icon = 'fa-heart-o'
    } else if (type === 'star') {
        fill_icon = 'fa-star'
        unfill_icon = 'fa-star-o'
    } else {
        fill_icon = 'fa-thumbs-up'
        unfill_icon = 'fa-thumbs-o-up'
    }
    // 이미 꽉 찬 하트인 경우 => 좋아요 취소
    if ($i_like.hasClass(fill_icon)) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: 'unlike',
            },
            success: function (response) {
                console.log("unlike")
                $i_like.addClass(unfill_icon).removeClass(fill_icon)
                // 좋아요 숫자 수정
                $a_like.find("span.like-num").text(response["count"])
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: 'like',
            },
            success: function (response) {
                console.log("like")
                $i_like.addClass(fill_icon).removeClass(unfill_icon)
                // 좋아요 숫자 수정
                $a_like.find("span.like-num").text(num2str(response["count"]))
            }
        })

    }
}

// 작성한 지 얼마나 시간이 지났는지
function time2str(date) {
    let today = new Date()
    let time = (today - date) / 1000 / 60  // 분

    if (time < 60) {
        return parseInt(time) + "분 전"
    }
    time = time / 60  // 시간
    if (time < 24) {
        return parseInt(time) + "시간 전"
    }
    time = time / 24
    if (time < 7) {
        return parseInt(time) + "일 전"
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

function num2str(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + "k"
    }
    if (count > 500) {
        return parseInt(count / 100) / 10 + "k"
    }
    count = `${count}`
    return count
}

function get_posts(username) {
    if (username == undefined) {
        username = ""
    }
    $("#post-box").empty()
    $.ajax({
        type: "GET",
        url: `/get_posts?username_give=${username}`,
        data: {},
        success: function (response) {
            console.log(response)
            if (response["result"] == "success") {
                let posts = response["posts"]
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i]
                    let time_post = new Date(post["date"])
                    let time_before = time2str(time_post)
                    let class_heart = post['heart_by_me'] ? "fa-heart" : "fa-heart-o"
                    let class_star = post['star_by_me'] ? "fa-star" : "fa-star-o"
                    let class_thumbs = post['thumbs_by_me'] ? "fa-thumbs-up" : "fa-thumbs-o-up"

                    let count_heart = num2str(post['count_heart'])
                    let count_star = num2str(post['count_star'])
                    let count_thumbs = num2str(post['count_thumbs'])
                    let html_temp = `<div class="box" id="${post["_id"]}">
                                        <article class="media">
                                            <div class="media-left">
                                                <a class="image is-64x64" href="/user/${post['username']}">
                                                    <img class="is-rounded" src="/static/${post['profile_pic_real']}"
                                                         alt="Image">
                                                </a>
                                            </div>
                                            <div class="media-content">
                                                <div class="content">
                                                    <p>
                                                        <strong>${post['profile_name']}</strong> <small>@${post['username']}</small> <small>${time_before}</small>
                                                        <br>
                                                        ${post['comment']}
                                                    </p>
                                                </div>
                                                <nav class="level is-mobile">
                                                    <div class="level-left">
                                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post['_id']}', 'heart')">
                                                            <span class="icon is-small"><i class="fa ${class_heart}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${count_heart}</span>
                                                        </a>
                                                         <a class="level-item is-sparta" aria-label="star" onclick="toggle_like('${post['_id']}', 'star')">
                                                            <span class="icon is-small"><i class="fa ${class_star}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span
                                                                class="like-num">${count_star}</span>
                                                        </a>
                                                        <a class="level-item is-sparta" aria-label="thumbs" onclick="toggle_like('${post['_id']}', 'thumbs')">
                                                            <span class="icon is-small"><i class="fa ${class_thumbs}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span
                                                                class="like-num">${count_thumbs}</span>
                                                        </a>
                                                    </div>

                                                </nav>
                                            </div>
                                        </article>
                                    </div>`
                    $("#post-box").append(html_temp)
                }
            }
        }
    })
}

function post() {
    let comment = $("#textarea-post").val()
    // 언제 작성되었는지 기록#}
    let today = new Date().toISOString()
    $.ajax({
        type: "POST",
        url: "/posting",
        data: {
            comment_give: comment,
            date_give: today
        },
        success: function (response) {
            // 포스팅을 성공하면 모달을 닫음
            $("#modal-post").removeClass("is-active")
            window.location.reload()
        }
    })
}