<template>
	<div class="full-screen">
		<header class="aui-bar aui-bar-nav">
			<a @click="backAction" class="aui-pull-left aui-btn">
				<span class="aui-iconfont aui-icon-left"></span>返回
			</a>
			<div class="aui-title">通知</div>
		</header>
		<div class="aui-content app-body">
			<ul class="aui-list aui-media-list">
				<li @click="handlePresenceAction(item)" v-for="(item,i) in subscribes" class="aui-list-item aui-list-item-middle">
					<div class="aui-media-list-item-inner">
						<div class="aui-list-item-media" style="width: 3rem;">
							<img src="../image/demo5.png" class="aui-img-round aui-list-img-sm">
						</div>
						<div class="aui-list-item-inner">
							<div class="aui-list-item-text">
								<div class="aui-list-item-title aui-font-size-14">{{item.from}}</div>
								<div class="aui-list-item-right">
									<div v-if="!item.isRead" class="aui-dot" style="position:relative;top:0; right:0"></div>
								</div>
							</div>
							<div class="aui-list-item-text">
								{{item.status}}
							</div>
						</div>
					</div>
				</li>
			</ul>

		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				subscribes: App.subscribes,
			};
		},
		methods: {
			backAction() {
				this.$router.back();
			},
			handlePresenceAction(msg) {
				if(msg.type == 'subscribe') {
					msg.isRead = true;
					App.computUnReadSubscribes();
					dialog.alert({
						title: "是否同意添加对方为好友?",
						buttons: ['拒绝', '同意']
					}, function(ret) {
						if(ret.buttonIndex === 2) { //同意
							conn.subscribed({
								to: msg.from,
								message: '[resp:true]'
							});
						} else if(ret.buttonIndex === 1) { //拒绝
							conn.unsubscribed({
								to: msg.from,
								message: 'rejectAddFriend'
							});
						}
					});
				}
			},
		},
		mounted() {

		}
	}
</script>

<style>

</style>