import{a8 as lt,a9 as P,aa as dt,ab as $,ac as K,W as U,ad as ct,ae as ht,af as pt,ag as mt,ah as ut,ai as tt,aj as gt,M as X,ak as ft,al as bt,am as Y,L as xt,$ as yt,an as vt,ao as wt,ap as V,aq as kt,ar as Ct,as as Et,v as Tt,at as Lt,au as St,av as It,aw as Bt,H as zt,ax as Rt,ay as Mt,az as Ft,aA as Nt,aB as Wt,aC as Ht,aD as At,aE as Dt,aF as Pt,aG as Vt,aH as Ot,aI as jt,aJ as Ut,aK as $t,aL as _t,aM as Gt,aN as Xt}from"./BeQtrGYw.js";class et{constructor(t,e){this.uid=t,this.cid=t.match(/^(.*):f(\d+)$/)[1],this.name=e,this.timestamp=0,this.cpu=0,this.gpu=0,this.fps=0,this.children=[],this.parent=null}}class Yt extends et{constructor(t,e,i,n){let s=e.name;s===""&&(e.isScene?s="Scene":e.isQuadMesh&&(s="QuadMesh")),super(t,s),this.scene=e,this.camera=i,this.renderTarget=n,this.isRenderStats=!0}}class qt extends et{constructor(t,e){super(t,e.name),this.computeNode=e,this.isComputeStats=!0}}class Zt extends lt{constructor(){super(),this.currentFrame=null,this.currentRender=null,this.currentNodes=null,this.lastFrame=null,this.frames=[],this.framesLib={},this.maxFrames=512,this._lastFinishTime=0,this._resolveTimestampPromise=null,this.isRendererInspector=!0}getParent(){return this.currentRender||this.getFrame()}begin(){this.currentFrame=this._createFrame(),this.currentRender=this.currentFrame,this.currentNodes=[]}finish(){const t=performance.now(),e=this.currentFrame;e.finishTime=t,e.deltaTime=t-(this._lastFinishTime>0?this._lastFinishTime:t),this.addFrame(e),this.fps=this._getFPS(),this.lastFrame=e,this.currentFrame=null,this.currentRender=null,this.currentNodes=null,this._lastFinishTime=t}_getFPS(){let t=0,e=0;for(let i=this.frames.length-1;i>=0;i--){const n=this.frames[i];if(t++,e+=n.deltaTime,e>=1e3)break}return t*1e3/e}_createFrame(){return{frameId:this.nodeFrame.frameId,resolvedCompute:!1,resolvedRender:!1,deltaTime:0,startTime:performance.now(),finishTime:0,miscellaneous:0,children:[],renders:[],computes:[]}}getFrame(){return this.currentFrame||this.lastFrame}getFrameById(t){return this.framesLib[t]||null}updateTabs(){}resolveFrame(){}async resolveTimestamp(){return this._resolveTimestampPromise!==null?this._resolveTimestampPromise:(this._resolveTimestampPromise=new Promise(t=>{requestAnimationFrame(async()=>{const e=this.getRenderer();await e.resolveTimestampsAsync(P.COMPUTE),await e.resolveTimestampsAsync(P.RENDER);const i=e.backend.getTimestampFrames(P.COMPUTE),n=e.backend.getTimestampFrames(P.RENDER),s=[...new Set([...i,...n])];for(const r of s){const o=this.getFrameById(r);if(o!==null){if(o.resolvedCompute===!1)if(o.computes.length>0){if(i.includes(r)){for(const a of o.computes)e.backend.hasTimestamp(a.uid)?a.gpu=e.backend.getTimestamp(a.uid):(a.gpu=0,a.gpuNotAvailable=!0);o.resolvedCompute=!0}}else o.resolvedCompute=!0;if(o.resolvedRender===!1)if(o.renders.length>0){if(n.includes(r)){for(const a of o.renders)e.backend.hasTimestamp(a.uid)?a.gpu=e.backend.getTimestamp(a.uid):(a.gpu=0,a.gpuNotAvailable=!0);o.resolvedRender=!0}}else o.resolvedRender=!0;o.resolvedCompute===!0&&o.resolvedRender===!0&&this.resolveFrame(o)}}this._resolveTimestampPromise=null,t()})}),this._resolveTimestampPromise)}get isAvailable(){return this.getRenderer()!==null}addFrame(t){if(this.frames.length>=this.maxFrames){const e=this.frames.shift();delete this.framesLib[e.frameId]}this.frames.push(t),this.framesLib[t.frameId]=t,this.isAvailable&&(this.updateTabs(),this.resolveTimestamp())}inspect(t){const e=this.currentNodes;e!==null?e.push(t):dt('RendererInspector: Unable to inspect node outside of frame scope. Use "renderer.setAnimationLoop()".')}beginCompute(t,e){const i=this.getFrame();if(!i)return;const n=new qt(t,e);n.timestamp=performance.now(),n.parent=this.currentCompute||this.getParent(),i.computes.push(n),this.currentRender!==null?this.currentRender.children.push(n):i.children.push(n),this.currentCompute=n}finishCompute(){if(!this.getFrame())return;const e=this.currentCompute;e.cpu=performance.now()-e.timestamp,this.currentCompute=e.parent.isComputeStats?e.parent:null}beginRender(t,e,i,n){const s=this.getFrame();if(!s)return;const r=new Yt(t,e,i,n);r.timestamp=performance.now(),r.parent=this.getParent(),s.renders.push(r),this.currentRender!==null?this.currentRender.children.push(r):s.children.push(r),this.currentRender=r}finishRender(){if(!this.getFrame())return;const e=this.currentRender;e.cpu=performance.now()-e.timestamp,this.currentRender=e.parent}}class Jt{static init(){if(document.getElementById("profiler-styles"))return;const t=`
:root {
	--profiler-bg: #1e1e24f5;
	--profiler-header-bg: #2a2a33aa;
	--profiler-header: #2a2a33;
	--profiler-border: #4a4a5a;
	--text-primary: #e0e0e0;
	--text-secondary: #9a9aab;
	--accent-color: #00aaff;
	--color-green: #4caf50;
	--color-yellow: #ffc107;
	--color-red: #f44336;
	--color-fps: rgb(63, 81, 181);
	--color-call: rgba(255, 185, 34, 1);
	--font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	--font-mono: 'Fira Code', 'Courier New', Courier, monospace;
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Fira+Code&display=swap');

#profiler-panel *, #profiler-toggle * {
	text-transform: initial;
	line-height: normal;
	box-sizing: border-box;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

#profiler-toggle {
	position: fixed;
	top: 15px;
	right: 15px;
	background-color: rgba(30, 30, 36, 0.85);
	border: 1px solid #4a4a5a54;
	border-radius: 12px 6px 6px 12px;
	color: var(--text-primary);
	cursor: pointer;
	z-index: 1001;
	transition: all 0.2s ease-in-out;
	/*font-size: 14px;*/
	font-size: 15px;
	backdrop-filter: blur(8px);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: stretch;
	padding: 0;
	overflow: hidden;
	font-family: var(--font-family);
}

#profiler-toggle.position-right.panel-open {
	right: auto;
	left: 15px;
	border-radius: 6px 12px 12px 6px;
	flex-direction: row-reverse;
}

#profiler-toggle.position-right.panel-open #builtin-tabs-container {
	border-right: none;
	border-left: 1px solid #262636;
}

#profiler-toggle:hover {
	border-color: var(--accent-color);
}

#profiler-toggle.panel-open #toggle-icon {
	background-color: rgba(0, 170, 255, 0.2);
	color: var(--accent-color);
}

#toggle-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	font-size: 20px;
	transition: background-color 0.2s;
}

#profiler-toggle:hover #toggle-icon {
	background-color: rgba(255, 255, 255, 0.05);
}

#profiler-toggle.panel-open:hover #toggle-icon {
	background-color: rgba(0, 170, 255, 0.3);
}

.toggle-separator {
	width: 1px;
	background-color: var(--profiler-border);
}

#toggle-text {
	display: flex;
	align-items: baseline;
	padding: 8px 14px;
	min-width: 80px;
	justify-content: right;
}

#toggle-text .fps-label {
	font-size: 0.7em;
	margin-left: 10px;
    color: #999;
}

#builtin-tabs-container {
	display: flex;
	align-items: stretch;
	gap: 0;
	border-right: 1px solid #262636;
	order: -1;
}

.builtin-tab-btn {
	background: transparent;
	border: none;
	color: var(--text-secondary);
	cursor: pointer;
	padding: 8px 14px;
	font-family: var(--font-family);
	font-size: 13px;
	font-weight: 600;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 32px;
	position: relative;
}

.builtin-tab-btn svg {
	width: 20px;
	height: 20px;
	stroke: currentColor;
}

.builtin-tab-btn:hover {
	background-color: rgba(255, 255, 255, 0.08);
	color: var(--accent-color);
}

.builtin-tab-btn:active {
	background-color: rgba(255, 255, 255, 0.12);
}

.builtin-tab-btn.active {
	background-color: rgba(0, 170, 255, 0.2);
	color: var(--accent-color);
}

.builtin-tab-btn.active:hover {
	background-color: rgba(0, 170, 255, 0.3);
}

#profiler-mini-panel {
	position: fixed;
	top: 60px;
	right: 15px;
	background-color: rgba(30, 30, 36, 0.85);
	border: 1px solid #4a4a5a54;
	border-radius: 8px;
	color: var(--text-primary);
	z-index: 9999;
	backdrop-filter: blur(8px);
	box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
	font-family: var(--font-family);
	font-size: 11px;
	width: 350px;
	max-height: calc(100vh - 100px);
	overflow-y: auto;
	overflow-x: hidden;
	display: none;
	opacity: 0;
	transform: translateY(-10px) scale(0.98);
	transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
	            transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

#profiler-mini-panel.position-right.panel-open {
	right: auto;
	left: 15px;
}

#profiler-mini-panel.visible {
	display: block;
	opacity: 1;
	transform: translateY(0) scale(1);
}

#profiler-mini-panel::-webkit-scrollbar {
	width: 6px;
}

#profiler-mini-panel::-webkit-scrollbar-track {
	background: transparent;
}

#profiler-mini-panel::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.15);
	border-radius: 3px;
	transition: background 0.2s;
}

#profiler-mini-panel::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.25);
}

.mini-panel-content {
	padding: 0;
	font-size: 11px;
	line-height: 1.5;
	font-family: var(--font-mono);
	letter-spacing: 0.3px;
	user-select: none;
	-webkit-user-select: none;
}

.mini-panel-content .profiler-content {
	display: block !important;
	background: transparent;
}

.mini-panel-content .list-scroll-wrapper {
	max-height: calc(100vh - 120px);
	overflow-y: auto;
	overflow-x: hidden;
	width: 100%;
}

.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar {
	width: 4px;
}

.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar-track {
	background: transparent;
}

.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 2px;
}

.mini-panel-content .list-scroll-wrapper::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.2);
}

.mini-panel-content .parameters {
	background: transparent;
	border: none;
	box-shadow: none;
	padding: 4px;
}

.mini-panel-content .list-container.parameters {
	padding: 2px 6px 0px 6px !important;
}

.mini-panel-content .list-header {
	display: none;
	padding: 2px 4px;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.mini-panel-content .list-item {
	border-bottom: 1px solid rgba(74, 74, 90, 0.2);
	transition: background-color 0.15s;
}

.mini-panel-content .list-item:last-child {
	border-bottom: none;
}

.mini-panel-content .list-item:hover {
	background-color: rgba(255, 255, 255, 0.04);
}

.mini-panel-content .list-item.actionable:hover {
	background-color: rgba(255, 255, 255, 0.06);
	cursor: pointer;
}

/* Style adjustments for lil-gui look */
.mini-panel-content .item-row {
	padding: 3px 8px;
	min-height: 24px;
}

.mini-panel-content .list-item-row {
	padding: 1px 4px;
	gap: 8px;
	min-height: 21px;
	align-items: center;
}

.mini-panel-content input[type="checkbox"] {
	width: 12px;
	height: 12px;
}

.mini-panel-content input[type="range"] {
	height: 18px;
}

.mini-panel-content .value-number input,
.mini-panel-content .value-slider input {
	background-color: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(74, 74, 90, 0.5);
	font-size: 10px;
}

.mini-panel-content .value-number input:focus,
.mini-panel-content .value-slider input:focus {
	border-color: var(--accent-color);
}

.mini-panel-content .value-slider {
	gap: 6px;
}

/* Compact nested items */
.mini-panel-content .list-item .list-item {
	margin-left: 8px;
}

.mini-panel-content .list-item .list-item .item-row,
.mini-panel-content .list-item .list-item .list-item-row {
	padding: 2px 6px;
	min-height: 22px;
}

/* Compact collapsible headers */
.mini-panel-content .collapsible .item-row,
.mini-panel-content .list-item-row.collapsible {
	padding: 2px 8px;
	font-weight: 600;
	min-height: 16px;
	display: flex;
	align-items: center;
}

.mini-panel-content .collapsible-icon {
	font-size: 10px;
	width: 14px;
	height: 14px;
}

.mini-panel-content .param-control input[type="range"] {
	height: 12px;
	margin-top: 1px;
	padding-top: 5px;
	user-select: none;
	-webkit-user-select: none;
	outline: none;
}

.mini-panel-content .param-control input[type="range"]::-webkit-slider-thumb {
	width: 14px;
	height: 14px;
	margin-top: -5px;
	user-select: none;
	-webkit-user-select: none;
}

.mini-panel-content .param-control input[type="range"]::-moz-range-thumb {
	width: 14px;
	height: 14px;
	user-select: none;
	-moz-user-select: none;
}

.mini-panel-content .list-children-container {
	padding-left: 0;
}

.mini-panel-content .param-control input[type="number"] {
	flex-basis: 60px !important;
}

.mini-panel-content .param-control {
	align-items: center;
}

.mini-panel-content .param-control select {
	font-size: 11px;
}

.mini-panel-content .list-item-wrapper {
	margin-top: 0;
	margin-bottom: 0;
}

#profiler-panel {
	position: fixed;
	z-index: 1001 !important;
	bottom: 0;
	left: 0;
	right: 0;
	height: 350px;
	background-color: var(--profiler-bg);
	backdrop-filter: blur(8px);
	border-top: 2px solid var(--profiler-border);
	color: var(--text-primary);
	display: flex;
	flex-direction: column;
	z-index: 1000;
	/*box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.5);*/
	transform: translateY(100%);
	transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.3s ease-out, width 0.3s ease-out;
	font-family: var(--font-mono);
}

#profiler-panel.resizing,
#profiler-panel.dragging {
	transition: none;
}

#profiler-panel.visible {
	transform: translateY(0);
}

#profiler-panel.maximized {
	height: 100vh;
}

/* Position-specific styles */
#profiler-panel.position-top {
	bottom: auto;
	top: 0;
	border-top: none;
	border-bottom: 2px solid var(--profiler-border);
	transform: translateY(-100%);
}

#profiler-panel.position-top.visible {
	transform: translateY(0);
}

#profiler-panel.position-bottom {
	/* Default position - already defined above */
}

#profiler-panel.position-left {
	top: 0;
	bottom: 0;
	left: 0;
	right: auto;
	width: 350px;
	height: 100%;
	border-top: none;
	border-right: 2px solid var(--profiler-border);
	transform: translateX(-100%);
}

#profiler-panel.position-left.visible {
	transform: translateX(0);
}

#profiler-panel.position-right {
	top: 0;
	bottom: 0;
	left: auto;
	right: 0;
	width: 350px;
	height: 100%;
	border-top: none;
	border-left: 2px solid var(--profiler-border);
	transform: translateX(100%);
}

#profiler-panel.position-right.visible {
	transform: translateX(0);
}

#profiler-panel.position-floating {
	border: 2px solid var(--profiler-border);
	border-radius: 8px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	transform: none !important;
	overflow: hidden;
}

#profiler-panel.position-floating.visible {
	transform: none !important;
}

#profiler-panel.position-floating .profiler-header {
	border-radius: 6px 6px 0 0;
}

#profiler-panel.position-floating .panel-resizer {
	bottom: 0;
	right: 0;
	top: auto;
	left: auto;
	width: 16px;
	height: 16px;
	cursor: nwse-resize;
	border-radius: 0 0 6px 0;
}

#profiler-panel.position-floating .panel-resizer::after {
	content: '';
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 10px;
	height: 10px;
	background: linear-gradient(135deg, transparent 0%, transparent 45%, var(--profiler-border) 45%, var(--profiler-border) 55%, transparent 55%);
}


.panel-resizer {
	position: absolute;
	top: -2px;
	left: 0;
	width: 100%;
	height: 5px;
	cursor: ns-resize;
	z-index: 1001;
	touch-action: none;
}

#profiler-panel.position-top .panel-resizer {
	top: auto;
	bottom: -2px;
}

#profiler-panel.position-left .panel-resizer {
	top: 0;
	left: auto;
	right: -2px;
	width: 5px;
	height: 100%;
	cursor: ew-resize;
}

#profiler-panel.position-right .panel-resizer {
	top: 0;
	left: -2px;
	right: auto;
	width: 5px;
	height: 100%;
	cursor: ew-resize;
}

.profiler-header {
	display: flex;
	background-color: var(--profiler-header-bg);
	border-bottom: 1px solid var(--profiler-border);
	flex-shrink: 0;
	justify-content: space-between;
	align-items: stretch;

	overflow-x: auto;
	overflow-y: hidden;
	width: calc(100% - 134px);
	height: 38px;
	user-select: none;
	-webkit-user-select: none;
}

/* Adjust header width based on panel position */
#profiler-panel.position-right .profiler-header,
#profiler-panel.position-left .profiler-header {
	width: calc(100% - 134px);
}

#profiler-panel.position-bottom .profiler-header,
#profiler-panel.position-top .profiler-header {
	width: calc(100% - 134px);
}

/* Adjust header width when position toggle button is hidden (mobile) */
#profiler-panel.hide-position-toggle .profiler-header {
	width: calc(100% - 90px);
}

/* ===== RULES FOR WHEN THERE ARE NO TABS ===== */

/* Horizontal mode (bottom/top) without tabs */
#profiler-panel.position-bottom.no-tabs:not(.maximized),
#profiler-panel.position-top.no-tabs:not(.maximized) {
	height: 38px !important;
	min-height: 38px !important;
}

#profiler-panel.position-bottom.no-tabs .profiler-header,
#profiler-panel.position-top.no-tabs .profiler-header {
	width: 100%;
	height: 38px;
	border-bottom: none;
}

#profiler-panel.position-bottom.no-tabs .profiler-content-wrapper,
#profiler-panel.position-top.no-tabs .profiler-content-wrapper {
	display: none;
}

#profiler-panel.position-bottom.no-tabs .panel-resizer,
#profiler-panel.position-top.no-tabs .panel-resizer {
	display: none;
}

/* Vertical mode (right/left) without tabs */
#profiler-panel.position-right.no-tabs:not(.maximized),
#profiler-panel.position-left.no-tabs:not(.maximized) {
	width: 45px !important;
	min-width: 45px !important;
}

/* Vertical layout for header when no tabs */
#profiler-panel.position-right.no-tabs .profiler-header,
#profiler-panel.position-left.no-tabs .profiler-header {
	width: 100%;
	flex-direction: column;
	height: 100%;
	border-bottom: none;
}

/* Vertical layout for controls when no tabs */
#profiler-panel.position-right.no-tabs .profiler-controls,
#profiler-panel.position-left.no-tabs .profiler-controls {
	position: static;
	flex-direction: column-reverse;
	justify-content: flex-end;
	width: 100%;
	height: 100%;
	border-bottom: none;
	border-left: none;
	background: transparent;
}

#profiler-panel.position-right.no-tabs .profiler-controls button,
#profiler-panel.position-left.no-tabs .profiler-controls button {
	width: 100%;
	height: 45px;
	border-left: none;
	border-top: none;
	border-bottom: 1px solid var(--profiler-border);
}

#profiler-panel.position-right.no-tabs .profiler-content-wrapper,
#profiler-panel.position-left.no-tabs .profiler-content-wrapper {
	display: none;
}

#profiler-panel.position-right.no-tabs .profiler-tabs,
#profiler-panel.position-left.no-tabs .profiler-tabs {
	display: none;
}

#profiler-panel.position-right.no-tabs .panel-resizer,
#profiler-panel.position-left.no-tabs .panel-resizer {
	display: none;
}

/* Hide position toggle on mobile without tabs */
#profiler-panel.hide-position-toggle.position-right.no-tabs:not(.maximized),
#profiler-panel.hide-position-toggle.position-left.no-tabs:not(.maximized) {
	width: 45px !important;
	min-width: 45px !important;
}

/* Hide drag indicator on mobile devices */
#profiler-panel.is-mobile .tab-btn.active::before {
	display: none;
}

.profiler-header::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.profiler-header::-webkit-scrollbar-track {
	background: transparent;
}

.profiler-header::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.profiler-header::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.profiler-header::-webkit-scrollbar-corner {
	background: transparent;
}

#profiler-panel.dragging .profiler-header {
	cursor: grabbing !important;
}

#profiler-panel.dragging {
	opacity: 0.8;
}

.profiler-tabs {
	display: flex;
	cursor: grab;
	position: relative;
}

.profiler-tabs:active {
	cursor: grabbing;
}

.profiler-tabs::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.profiler-tabs::-webkit-scrollbar-track {
	background: transparent;
}

.profiler-tabs::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.profiler-tabs::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.profiler-tabs::-webkit-scrollbar-corner {
	background: transparent;
}

.profiler-controls {
	display: flex;
	position: absolute;
	right: 0;
	top: 0;
	height: 38px;
	background: var(--profiler-header-bg);
	border-bottom: 1px solid var(--profiler-border);
}

.tab-btn {
	position: relative;
	background: transparent;
	border: none;
	/*border-right: 1px solid var(--profiler-border);*/
	color: var(--text-secondary);
	padding: 8px 18px;
	cursor: default;
	display: flex;
	align-items: center;
	font-family: var(--font-family);
	font-weight: 600;
	font-size: 14px;
	user-select: none;
	transition: opacity 0.2s, transform 0.2s;
	touch-action: pan-x;
}

.tab-btn.active {
	border-bottom: 2px solid var(--accent-color);
	color: white;
}

.tab-btn.active::before {
	content: '⋮⋮';
	position: absolute;
	left: 3px;
	top: calc(50% - .1rem);
	transform: translateY(-50%);
	color: var(--profiler-border);
	font-size: 18px;
	letter-spacing: -2px;
	opacity: 0.6;
}

.tab-btn.no-detach.active::before {
	display: none;
}

#floating-btn,
#maximize-btn,
#hide-panel-btn {
	background: transparent;
	border: none;
	border-left: 1px solid var(--profiler-border);
	color: var(--text-secondary);
	width: 45px;
	height: 100%;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

/* Disable transitions in vertical mode to avoid broken animations */
#profiler-panel.position-right #floating-btn,
#profiler-panel.position-right #maximize-btn,
#profiler-panel.position-right #hide-panel-btn,
#profiler-panel.position-left #floating-btn,
#profiler-panel.position-left #maximize-btn,
#profiler-panel.position-left #hide-panel-btn {
	transition: background-color 0.2s, color 0.2s;
}

#floating-btn:hover,
#maximize-btn:hover,
#hide-panel-btn:hover {
	background-color: rgba(255, 255, 255, 0.1);
	color: var(--text-primary);
}

/* Hide maximize button when there are no tabs */
#profiler-panel.position-right.no-tabs #maximize-btn,
#profiler-panel.position-left.no-tabs #maximize-btn,
#profiler-panel.position-bottom.no-tabs #maximize-btn,
#profiler-panel.position-top.no-tabs #maximize-btn {
	display: none !important;
}

.profiler-content-wrapper {
	flex-grow: 1;
	overflow: hidden;
	position: relative;
}

.profiler-content {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	font-size: 13px;
	visibility: hidden;
	opacity: 0;
	transition: opacity 0.2s, visibility 0.2s;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	user-select: none;
	-webkit-user-select: none;
}

.profiler-content.active {
	visibility: visible;
	opacity: 1;
}

.profiler-content {
	overflow: auto; /* make sure scrollbars can appear */
}

.profiler-content::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.profiler-content::-webkit-scrollbar-track {
	background: transparent;
}

.profiler-content::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.profiler-content::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.profiler-content::-webkit-scrollbar-corner {
	background: transparent;
}

.profiler-content {
	scrollbar-width: thin; /* "auto" | "thin" */
	scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
}

.list-item-row {
	display: grid;
	align-items: center;
	padding: 4px 8px;
	border-radius: 3px;
	transition: background-color 0.2s;
	gap: 10px;
	border-bottom: none;
	user-select: none;
	-webkit-user-select: none;
}

.parameters .list-item-row {
	min-height: 31px;
}

.mini-panel-content .parameters .list-item-row {
	min-height: 21px;
}

.list-item-wrapper {
	margin-top: 2px;
	margin-bottom: 2px;
	user-select: none;
	-webkit-user-select: none;
}

.list-item-wrapper:first-child {
	/*margin-top: 0;*/
}

.list-item-wrapper:not(.header-wrapper):nth-child(odd) > .list-item-row {
	background-color: rgba(0,0,0,0.1);
}

.list-item-wrapper.header-wrapper>.list-item-row {
	color: var(--accent-color);
	background-color: rgba(0, 170, 255, 0.1);
}

.list-item-wrapper.header-wrapper>.list-item-row>.list-item-cell:first-child {
	font-weight: 600;
	line-height: 1;
}

.list-item-row.collapsible,
.list-item-row.actionable {
	cursor: pointer;
}

.list-item-row.collapsible {
	background-color: rgba(0, 170, 255, 0.15) !important;
	min-height: 23px;
}

.list-item-row.collapsible.alert,
.list-item-row.alert {
	background-color: rgba(244, 67, 54, 0.1) !important;
}

@media (hover: hover) {

	.list-item-row:hover:not(.collapsible):not(.no-hover),
	.list-item-row:hover:not(.no-hover),
	.list-item-row.actionable:hover,
	.list-item-row.collapsible.actionable:hover {
		background-color: rgba(255, 255, 255, 0.05) !important;
	}

	.list-item-row.collapsible:hover {
		background-color: rgba(0, 170, 255, 0.25) !important;
	}

}

.list-item-cell {
	white-space: pre;
	display: flex;
	align-items: center;
	user-select: none;
	-webkit-user-select: none;
}

.list-item-cell:not(:first-child) {
	justify-content: flex-end;
	font-weight: 600;
}

.list-header {
	display: grid;
	align-items: center;
	padding: 4px 8px;
	font-weight: 600;
	color: var(--text-secondary);
	padding-bottom: 6px;
	border-bottom: 1px solid var(--profiler-border);
	margin-bottom: 5px;
	gap: 10px;
	user-select: none;
	-webkit-user-select: none;
}

.list-item-wrapper.section-start {
	margin-top: 5px;
	margin-bottom: 5px;
}

.list-header .list-header-cell:not(:first-child) {
	text-align: right;
}

.list-children-container {
	padding-left: 1.5em;
	overflow: hidden;
	transition: max-height 0.1s ease-out;
	margin-top: 2px;
}

.list-children-container.closed {
	max-height: 0;
}

.item-toggler {
	display: inline-block;
	margin-right: 0.8em;
	text-align: left;
}

.list-item-row.open .item-toggler::before {
	content: '-';
}

.list-item-row:not(.open) .item-toggler::before {
	content: '+';
}

.list-item-cell .value.good {
	color: var(--color-green);
}

.list-item-cell .value.warn {
	color: var(--color-yellow);
}

.list-item-cell .value.bad {
	color: var(--color-red);
}

.list-scroll-wrapper {
	width: max-content;
	min-width: 100%;
	display: flex;
	flex-direction: column;
	min-height: 100%;
}

.list-container.parameters .list-item-row:not(.collapsible) {
}

.graph-container {
	width: 100%;
	box-sizing: border-box;
	padding: 8px 0;
	position: relative;
}

.graph-svg {
	width: 100%;
	height: 80px;
	background-color: var(--profiler-header);
	border: 1px solid var(--profiler-border);
	border-radius: 4px;
}

.graph-path {
	stroke-width: 2;
	fill-opacity: 0.4;
}

.console-header {
	padding: 10px;
	border-bottom: 1px solid var(--profiler-border);
	display: flex;
	gap: 20px;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
}

.console-buttons-group {
	display: flex;
	gap: 20px;
}

.console-filter-input {
	background-color: var(--profiler-bg);
	border: 1px solid var(--profiler-border);
	color: var(--text-primary);
	border-radius: 4px;
	padding: 4px 8px;
	font-family: var(--font-mono);
	flex-grow: 1;
	max-width: 300px;
	border-radius: 15px;
}

.console-filter-input:focus {
	outline: none;
	border-color: var(--text-secondary);
}

.console-copy-button {
	background: transparent;
	border: none;
	color: var(--text-secondary);
	cursor: pointer;
	padding: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	transition: color 0.2s, background-color 0.2s;
}

.console-copy-button:hover {
	color: var(--text-primary);
	background-color: var(--profiler-hover);
}

.console-copy-button.copied {
	color: var(--color-green);
}

#console-log {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 10px;
	overflow-y: auto;
	flex-grow: 1;
	user-select: text;
	-webkit-user-select: text;
}

.log-message {
	padding: 2px 5px;
	white-space: pre-wrap;
	word-break: break-all;
	border-radius: 3px;
	line-height: 1.5 !important;
}

.log-message.hidden {
	display: none;
}

.log-message.info {
	color: var(--text-primary);
}

.log-message.warn {
	color: var(--color-yellow);
}

.log-message.error {
	color: #f9dedc;
	background-color: rgba(244, 67, 54, 0.1);
}

.log-prefix {
	color: var(--text-secondary);
	margin-right: 8px;
}

.log-code {
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
	padding: 1px 4px;
}

.thumbnail-container {
	display: flex;
	align-items: center;
}

.thumbnail-svg {
	width: 40px;
	height: 22.5px;
	flex-shrink: 0;
	margin-right: 8px;
}

.param-control {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	width: 100%;
}

.param-control input,
.param-control select,
.param-control button {
	background-color: var(--profiler-bg);
	border: 1px solid var(--profiler-border);
	color: var(--text-primary);
	border-radius: 4px;
	padding: 4px 6px;
	padding-bottom: 2px;
	font-family: var(--font-mono);
	width: 100%;
	box-sizing: border-box;
}

.param-control input:focus {
	outline: none;
	border-color: var(--accent-color);
}

.param-control select {
	padding-top: 3px;
	padding-bottom: 1px;
}

.param-control input[type="number"] {
	cursor: ns-resize;
}

.param-control input[type="color"] {
	padding: 2px;
}

.param-control button {
	cursor: pointer;
	transition: background-color 0.2s;
}

.param-control button:hover {
	background-color: var(--profiler-header);
}

.param-control-vector {
	display: flex;
	gap: 5px;
}

.custom-checkbox {
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	gap: 8px;
	will-change: transform;
}

.custom-checkbox input {
	display: none;
}

.custom-checkbox .checkmark {
	width: 14px;
	height: 14px;
	border: 1px solid var(--accent-color);
	border-radius: 3px;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	transition: background-color 0.2s, border-color 0.2s;
}

.custom-checkbox .checkmark::after {
	content: '';
	width: 6px;
	height: 6px;
	background-color: var(--accent-color);
	border-radius: 1px;
	display: block;
	transform: scale(0);
	transition: transform 0.2s;
}

.custom-checkbox input:checked+.checkmark {
	border-color: var(--accent-color);
}

.custom-checkbox input:checked+.checkmark::after {
	transform: scale(1);
}

.param-control input[type="range"] {
	-webkit-appearance: none;
	appearance: none;
	width: 100%;
	height: 16px;
	background: var(--profiler-header);
	border-radius: 5px;
	border: 1px solid var(--profiler-border);
	outline: none;
	padding: 0px;
	padding-top: 8px;
}

.param-control input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 18px;
	height: 18px;
	background: var(--profiler-bg);
	border: 1px solid var(--accent-color);
	border-radius: 3px;
	cursor: pointer;
	margin-top: -8px;
}

.param-control input[type="range"]::-moz-range-thumb {
	width: 18px;
	height: 18px;
	background: var(--profiler-bg);
	border: 2px solid var(--accent-color);
	border-radius: 3px;
	cursor: pointer;
}

.param-control input[type="range"]::-moz-range-track {
	width: 100%;
	height: 16px;
	background: var(--profiler-header);
	border-radius: 5px;
	border: 1px solid var(--profiler-border);
}

/* Override .param-control styles for mini-panel-content */
.mini-panel-content input,
.mini-panel-content select,
.mini-panel-content button {
	padding: 2px 4px;
	height: 21px;
	line-height: 1.4;
	padding-top: 4px;
}

.mini-panel-content .param-control input,
.mini-panel-content .param-control select,
.mini-panel-content .param-control button {
	background-color: #1e1e24c2;
	line-height: 1.0;
}

.mini-panel-content .param-control select {
	padding: 2px 2px;
	padding-top: 3px;
}

.mini-panel-content .param-control input[type="number"]::-webkit-outer-spin-button,
.mini-panel-content .param-control input[type="number"]::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.mini-panel-content .param-control input[type="number"] {
	-moz-appearance: textfield;
}

.mini-panel-content .list-item-cell span {
	position: relative;
	top: 1px;
	margin-left: 2px;
}

.mini-panel-content .custom-checkbox .checkmark {
	width: 12px;
	height: 12px;
	margin-bottom: 2px;
	will-change: transform;
}

.mini-panel-content .list-container.parameters .list-item-row:not(.collapsible) {
	margin-bottom: 2px;
}

@media screen and (max-width: 450px) and (orientation: portrait) {

	.console-filter-input {
		max-width: 100px;
	}

}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {

	.panel-resizer {
		top: -10px !important;
		height: 20px !important;
	}

	#profiler-panel.position-top .panel-resizer {
		top: auto !important;
		bottom: -10px !important;
		height: 20px !important;
	}

	#profiler-panel.position-left .panel-resizer {
		right: -10px !important;
		width: 20px !important;
		height: 100% !important;
	}

	#profiler-panel.position-right .panel-resizer {
		left: -10px !important;
		width: 20px !important;
		height: 100% !important;
	}

	.detached-tab-resizer-top,
	.detached-tab-resizer-bottom {
		height: 10px !important;
	}

	.detached-tab-resizer-left,
	.detached-tab-resizer-right {
		width: 10px !important;
	}

}

.drag-preview-indicator {
	position: fixed;
	background-color: rgba(0, 170, 255, 0.2);
	border: 2px dashed var(--accent-color);
	z-index: 999;
	pointer-events: none;
	transition: all 0.2s ease-out;
}

/* Detached Tab Windows */
.detached-tab-panel {
	position: fixed;
	width: 500px;
	height: 400px;
	background: var(--profiler-bg);
	border: 1px solid var(--profiler-border);
	border-radius: 8px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
	z-index: 1002;
	display: flex;
	flex-direction: column;
	backdrop-filter: blur(10px);
	overflow: hidden;
	opacity: 1;
	visibility: visible;
	transition: opacity 0.2s, visibility 0.2s;
}

#profiler-panel:not(.visible) ~ * .detached-tab-panel,
body:has(#profiler-panel:not(.visible)) .detached-tab-panel {
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
}

.detached-tab-header {
	background: var(--profiler-header-bg);
	padding: 0 7px 0 15px;
	font-family: var(--font-family);
	font-size: 14px;
	color: var(--text-primary);
	font-weight: 600;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid var(--profiler-border);
	cursor: grab;
	user-select: none;
	height: 38px;
	flex-shrink: 0;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	touch-action: none;
}

.detached-tab-header:active {
	cursor: grabbing;
}

.detached-header-controls {
	display: flex;
	gap: 5px;
}

.detached-reattach-btn {
	background: transparent;
	border: none;
	color: var(--text-secondary);
	font-family: var(--font-family);
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 4px;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.detached-reattach-btn:hover {
	background: rgba(0, 170, 255, 0.2);
	color: var(--accent-color);
}

.detached-tab-content {
	flex: 1;
	overflow: auto;
	position: relative;
	background: var(--profiler-bg);
}

.detached-tab-content::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.detached-tab-content::-webkit-scrollbar-track {
	background: transparent;
}

.detached-tab-content::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 10px;
	transition: background 0.3s ease;
}

.detached-tab-content::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.4);
}

.detached-tab-content::-webkit-scrollbar-corner {
	background: transparent;
}

.detached-tab-content .profiler-content {
	display: block !important;
	height: 100%;
	visibility: visible !important;
	opacity: 1 !important;
	position: relative !important;
}

.detached-tab-content .profiler-content > * {
	font-family: var(--font-mono);
	color: var(--text-primary);
}

.detached-tab-resizer {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 20px;
	height: 20px;
	cursor: nwse-resize;
	z-index: 10;
	touch-action: none;
}

.detached-tab-resizer::after {
	content: '';
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 12px;
	height: 12px;
	border-right: 2px solid var(--profiler-border);
	border-bottom: 2px solid var(--profiler-border);
	border-bottom-right-radius: 6px;
	opacity: 0.5;
}

.detached-tab-resizer:hover::after {
	opacity: 1;
	border-color: var(--accent-color);
}

/* Edge resizers */
.detached-tab-resizer-top {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 5px;
	cursor: ns-resize;
	z-index: 10;
	touch-action: none;
}

.detached-tab-resizer-right {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 5px;
	cursor: ew-resize;
	z-index: 10;
	touch-action: none;
}

.detached-tab-resizer-bottom {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 5px;
	cursor: ns-resize;
	z-index: 10;
	touch-action: none;
}

.detached-tab-resizer-left {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	width: 5px;
	cursor: ew-resize;
	z-index: 10;
	touch-action: none;
}

/* Input number spin buttons - hide arrows */
/* Chrome, Safari, Edge, Opera */
#profiler-panel input[type="number"]::-webkit-outer-spin-button,
#profiler-panel input[type="number"]::-webkit-inner-spin-button,
.detached-tab-content input[type="number"]::-webkit-outer-spin-button,
.detached-tab-content input[type="number"]::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

/* Firefox */
#profiler-panel input[type="number"],
.detached-tab-content input[type="number"] {
	-moz-appearance: textfield;
}

.panel-action-btn {
	background: transparent;
	color: var(--text-primary);
	border: 1px solid var(--profiler-border);
	border-radius: 4px;
	padding: 6px 12px;
	cursor: pointer;
	font-family: var(--font-family);
	font-size: 12px;
	transition: background-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.panel-action-btn:hover {
	background-color: rgba(255, 255, 255, 0.05);
}
`,e=document.createElement("style");e.id="profiler-styles",e.textContent=t,document.head.appendChild(e)}}class Qt extends ${constructor(t){super(),this.inspector=t,this.tabs={},this.activeTabId=null,this.isResizing=!1,this.lastHeightBottom=350,this.lastWidthRight=450,this.position="bottom",this.detachedWindows=[],this.maxZIndex=1002,this.nextTabOriginalIndex=0,Jt.init(),this.setupShell(),this.setupResizing(),this.setupWindowResizeListener(),this.setupOrientationListener()}getSize(){return this.panel.classList.contains("visible")===!1||this.panel.classList.contains("no-tabs")?{width:0,height:0}:this.position==="right"?{width:this.panel.offsetWidth,height:0}:{width:0,height:this.panel.offsetHeight}}get isMobile(){return this.detectMobile()}get isSmallScreen(){return window.innerWidth<=768}detectMobile(){const t=navigator.userAgent||navigator.vendor||window.opera,e=/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(t),i="ontouchstart"in window||navigator.maxTouchPoints>0;return e||i&&this.isSmallScreen}setupOrientationListener(){const t=()=>{if(!this.isMobile)return;const i=window.innerWidth>window.innerHeight?"right":"bottom";this.position!==i&&this.setPosition(i)};t(),window.addEventListener("orientationchange",t),window.addEventListener("resize",t)}setupWindowResizeListener(){const t=()=>{this.detachedWindows.forEach(i=>{this.constrainWindowToBounds(i.panel)})},e=()=>{if(this.panel.classList.contains("maximized"))return;const i=window.innerWidth,n=window.innerHeight;if(this.position==="bottom"){const s=this.panel.offsetHeight,r=n-50;s>r&&(this.panel.style.height=`${r}px`,this.lastHeightBottom=r)}else if(this.position==="right"){const s=this.panel.offsetWidth,r=i-50;s>r&&(this.panel.style.width=`${r}px`,this.lastWidthRight=r)}};window.addEventListener("resize",()=>{this.isSmallScreen?(this.floatingBtn.style.display="none",this.panel.classList.add("hide-position-toggle")):(this.floatingBtn.style.display="",this.panel.classList.remove("hide-position-toggle")),this.isMobile?this.panel.classList.add("is-mobile"):this.panel.classList.remove("is-mobile"),t(),e()})}constrainWindowToBounds(t){const e=window.innerWidth,i=window.innerHeight,n=t.offsetWidth,s=t.offsetHeight;let r=parseFloat(t.style.left)||t.offsetLeft||0,o=parseFloat(t.style.top)||t.offsetTop||0;const a=n/2,l=s/2;r+n>e+a&&(r=e+a-n),r<-a&&(r=-a),o+s>i+l&&(o=i+l-s),o<-l&&(o=-l),t.style.left=`${r}px`,t.style.top=`${o}px`}setupShell(){this.domElement=document.createElement("div"),this.domElement.id="profiler-shell",this.toggleButton=document.createElement("button"),this.toggleButton.id="profiler-toggle",this.toggleButton.innerHTML=`
<span id="builtin-tabs-container"></span>
<span id="toggle-text">
	<span id="fps-counter">-</span>
	<span class="fps-label">FPS</span>
</span>
<span id="toggle-icon">
	<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad-horizontal-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.5 20h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v5.5" /><path d="M9 17h2" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M20.2 20.2l1.8 1.8" /></svg>
</span>
`,this.toggleButton.onclick=()=>this.togglePanel(),this.builtinTabsContainer=this.toggleButton.querySelector("#builtin-tabs-container"),this.miniPanel=document.createElement("div"),this.miniPanel.id="profiler-mini-panel",this.miniPanel.className="profiler-mini-panel",this.panel=document.createElement("div"),this.panel.id="profiler-panel";const t=document.createElement("div");t.className="profiler-header",t.addEventListener("wheel",s=>{s.deltaY!==0&&(s.preventDefault(),t.scrollLeft+=s.deltaY*.25)},{passive:!1}),this.tabsContainer=document.createElement("div"),this.tabsContainer.className="profiler-tabs";const e=document.createElement("div");e.className="profiler-controls",this.floatingBtn=document.createElement("button"),this.floatingBtn.id="floating-btn",this.floatingBtn.title="Switch to Right Side",this.floatingBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>',this.floatingBtn.onclick=()=>this.togglePosition(),this.isSmallScreen&&(this.floatingBtn.style.display="none",this.panel.classList.add("hide-position-toggle")),this.isMobile&&this.panel.classList.add("is-mobile"),this.maximizeBtn=document.createElement("button"),this.maximizeBtn.id="maximize-btn",this.maximizeBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',this.maximizeBtn.onclick=()=>this.toggleMaximize();const i=document.createElement("button");i.id="hide-panel-btn",i.textContent="-",i.onclick=()=>this.togglePanel(),e.append(this.floatingBtn,this.maximizeBtn,i),t.append(this.tabsContainer,e),this.contentWrapper=document.createElement("div"),this.contentWrapper.className="profiler-content-wrapper";const n=document.createElement("div");n.className="panel-resizer",this.panel.append(n,t,this.contentWrapper),this.domElement.append(this.toggleButton,this.miniPanel,this.panel),this.panel.classList.add(`position-${this.position}`),this.position==="right"&&(this.toggleButton.classList.add("position-right"),this.miniPanel.classList.add("position-right"))}setupResizing(){const t=this.panel.querySelector(".panel-resizer"),e=i=>{this.isResizing=!0,this.panel.classList.add("resizing"),t.setPointerCapture(i.pointerId);const n=i.clientX,s=i.clientY,r=this.panel.offsetHeight,o=this.panel.offsetWidth,a=d=>{if(!this.isResizing)return;d.preventDefault();const h=d.clientX,c=d.clientY;if(this.position==="bottom"){const m=r-(c-s);m>100&&m<window.innerHeight-50&&(this.panel.style.height=`${m}px`)}else if(this.position==="right"){const m=o-(h-n);m>200&&m<window.innerWidth-50&&(this.panel.style.width=`${m}px`)}this.dispatchEvent({type:"resize"})},l=()=>{this.isResizing=!1,this.panel.classList.remove("resizing"),t.removeEventListener("pointermove",a),t.removeEventListener("pointerup",l),t.removeEventListener("pointercancel",l),this.panel.classList.contains("maximized")||(this.position==="bottom"?this.lastHeightBottom=this.panel.offsetHeight:this.position==="right"&&(this.lastWidthRight=this.panel.offsetWidth),this.saveLayout())};t.addEventListener("pointermove",a),t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l)};t.addEventListener("pointerdown",e)}toggleMaximize(){this.panel.classList.contains("maximized")?(this.panel.classList.remove("maximized"),this.position==="bottom"?(this.panel.style.height=`${this.lastHeightBottom}px`,this.panel.style.width="100%"):this.position==="right"&&(this.panel.style.height="100%",this.panel.style.width=`${this.lastWidthRight}px`),this.maximizeBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'):(this.position==="bottom"?this.lastHeightBottom=this.panel.offsetHeight:this.position==="right"&&(this.lastWidthRight=this.panel.offsetWidth),this.panel.classList.add("maximized"),this.position==="bottom"?(this.panel.style.height="100vh",this.panel.style.width="100%"):this.position==="right"&&(this.panel.style.height="100%",this.panel.style.width="100vw"),this.maximizeBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>'),this.dispatchEvent({type:"resize"})}hide(){this.miniPanel.classList.remove("visible"),this.miniPanel.querySelectorAll(".mini-panel-content").forEach(t=>{t.style.display="none"}),this.builtinTabsContainer.querySelectorAll(".builtin-tab-btn").forEach(t=>{t.classList.remove("active")})}show(t){if(this.hide(),t.builtinButton.classList.add("active"),!t.miniContent.firstChild)for(;t.content.firstChild;)t.miniContent.appendChild(t.content.firstChild);t.miniContent.style.display="block",this.miniPanel.classList.add("visible")}addTab(t){this.tabs[t.id]=t,t.originalIndex=this.nextTabOriginalIndex++,t.allowDetach===!1&&t.button.classList.add("no-detach"),t.onVisibilityChange=()=>this.updatePanelSize(),this.setupTabDragAndDrop(t),t.builtin||this.tabsContainer.appendChild(t.button),this.contentWrapper.appendChild(t.content),t.isVisible||(t.button.style.display="none",t.content.style.display="none"),t.builtin&&this.addBuiltinTab(t),this.updatePanelSize(),t.profiler=this}addBuiltinTab(t){const e=document.createElement("button");e.className="builtin-tab-btn",t.icon?e.innerHTML=t.icon:e.textContent=t.button.textContent.charAt(0).toUpperCase(),e.title=t.button.textContent;const i=document.createElement("div");i.className="mini-panel-content",i.style.display="none",t.builtinButton=e,t.miniContent=i,this.miniPanel.appendChild(i),e.onclick=n=>{n.stopPropagation(),i.style.display!=="none"&&i.children.length>0?this.hide():this.show(t)},this.builtinTabsContainer.appendChild(e),t.builtinButton=e,t.miniContent=i,t.isVisible||(e.style.display="none",i.style.display="none",Array.from(this.builtinTabsContainer.querySelectorAll(".builtin-tab-btn")).some(s=>s.style.display!=="none")||(this.builtinTabsContainer.style.display="none"))}removeTab(t){if(!(!t||this.tabs[t.id]===void 0)){if(delete this.tabs[t.id],t.isDetached&&t.detachedWindow){t.detachedWindow.panel&&t.detachedWindow.panel.parentNode&&t.detachedWindow.panel.parentNode.removeChild(t.detachedWindow.panel);const e=this.detachedWindows.indexOf(t.detachedWindow);e!==-1&&this.detachedWindows.splice(e,1)}if(t.builtin?(t.builtinButton&&t.builtinButton.parentNode&&t.builtinButton.parentNode.removeChild(t.builtinButton),t.miniContent&&t.miniContent.parentNode&&t.miniContent.parentNode.removeChild(t.miniContent),Array.from(this.builtinTabsContainer.querySelectorAll(".builtin-tab-btn")).some(i=>i.style.display!=="none")||(this.builtinTabsContainer.style.display="none")):t.button&&t.button.parentNode&&t.button.parentNode.removeChild(t.button),t.content&&t.content.parentNode&&t.content.parentNode.removeChild(t.content),this.activeTabId===t.id){this.activeTabId=null;const e=Object.values(this.tabs).filter(i=>!i.isDetached&&i.isVisible);e.length>0?this.setActiveTab(e[0].id):this.updatePanelSize()}else this.updatePanelSize();t.onVisibilityChange=null,t.profiler=null}}updatePanelSize(){Object.values(this.tabs).some(e=>!e.isDetached&&e.isVisible)?(this.panel.classList.remove("no-tabs"),Object.keys(this.tabs).length>0&&(this.position==="bottom"?parseInt(this.panel.style.height)===38&&(this.panel.style.height=`${this.lastHeightBottom}px`):this.position==="right"&&parseInt(this.panel.style.width)===45&&(this.panel.style.width=`${this.lastWidthRight}px`))):(this.panel.classList.add("no-tabs"),this.panel.classList.contains("maximized")&&(this.panel.classList.remove("maximized"),this.maximizeBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'),this.position==="bottom"?this.panel.style.height="38px":this.position==="right"&&(this.panel.style.width="45px")),this.dispatchEvent({type:"resize"})}setupTabDragAndDrop(t){if(t.button.addEventListener("click",()=>{e||this.setActiveTab(t.id)}),t.allowDetach===!1){t.button.style.cursor="default";return}let e=!1,i,n,s=!1,r=null;const o=10,a=h=>{i=h.clientX,n=h.clientY,e=!1,s=!1,t.button.setPointerCapture(h.pointerId)},l=h=>{const c=h.clientX,m=h.clientY,u=Math.abs(c-i),f=Math.abs(m-n);!e&&(u>o||f>o)&&(e=!0,t.button.style.cursor="grabbing",t.button.style.opacity="0.5",t.button.style.transform="scale(1.05)",r=this.createPreviewWindow(t,c,m),r.style.opacity="0.8"),e&&r&&(s=!0,h.preventDefault(),r.style.left=`${c-200}px`,r.style.top=`${m-20}px`)},d=()=>{if(e&&s&&r){r.parentNode&&r.parentNode.removeChild(r);const h=parseInt(r.style.left)+200,c=parseInt(r.style.top)+20;this.detachTab(t,h,c)}else s||this.setActiveTab(t.id),r&&r.parentNode&&r.parentNode.removeChild(r);t.button.style.opacity="",t.button.style.transform="",t.button.style.cursor="",e=!1,s=!1,r=null,t.button.removeEventListener("pointermove",l),t.button.removeEventListener("pointerup",d),t.button.removeEventListener("pointercancel",d)};t.button.addEventListener("pointerdown",h=>{this.isMobile&&h.pointerType!=="mouse"||(a(h),t.button.addEventListener("pointermove",l),t.button.addEventListener("pointerup",d),t.button.addEventListener("pointercancel",d))}),t.button.style.cursor="grab"}createPreviewWindow(t,e,i){const n=document.createElement("div");n.className="detached-tab-panel",n.style.left=`${e-200}px`,n.style.top=`${i-20}px`,n.style.pointerEvents="none",this.maxZIndex++,n.style.setProperty("z-index",this.maxZIndex,"important");const s=document.createElement("div");s.className="detached-tab-header";const r=document.createElement("span");r.textContent=t.button.textContent.replace("⇱","").trim(),s.appendChild(r);const o=document.createElement("div");o.className="detached-header-controls";const a=document.createElement("button");a.className="detached-reattach-btn",a.innerHTML="↩",o.appendChild(a),s.appendChild(o);const l=document.createElement("div");l.className="detached-tab-content";const d=document.createElement("div");return d.className="detached-tab-resizer",n.appendChild(d),n.appendChild(s),n.appendChild(l),document.body.appendChild(n),n}detachTab(t,e,i){if(t.isDetached||t.allowDetach===!1)return;const s=Array.from(this.tabsContainer.children).map(l=>Object.keys(this.tabs).find(d=>this.tabs[d].button===l)).filter(l=>l!==void 0),r=s.indexOf(t.id);let o=null;if(this.activeTabId===t.id){t.setActive(!1);const l=s.filter(d=>d!==t.id&&!this.tabs[d].isDetached&&this.tabs[d].isVisible);if(l.length>0){for(let d=r-1;d>=0;d--)if(l.includes(s[d])){o=s[d];break}if(!o){for(let d=r+1;d<s.length;d++)if(l.includes(s[d])){o=s[d];break}}o||(o=l[0])}}t.button.parentNode&&t.button.parentNode.removeChild(t.button),t.content.parentNode&&t.content.parentNode.removeChild(t.content);const a=this.createDetachedWindow(t,e,i);this.detachedWindows.push(a),t.isDetached=!0,t.detachedWindow=a,o?this.setActiveTab(o):this.activeTabId===t.id&&(this.activeTabId=null),this.updatePanelSize(),this.saveLayout()}createDetachedWindow(t,e,i){const n=window.innerWidth,s=window.innerHeight,r=400,o=300;let a=e-200,l=i-20;a+r>n&&(a=n-r),a<0&&(a=0),l+o>s&&(l=s-o),l<0&&(l=0);const d=document.createElement("div");d.className="detached-tab-panel",d.style.left=`${a}px`,d.style.top=`${l}px`,this.panel.classList.contains("visible")||(d.style.opacity="0",d.style.visibility="hidden",d.style.pointerEvents="none"),t.isVisible||(d.style.display="none");const h=document.createElement("div");h.className="detached-tab-header";const c=document.createElement("span");c.textContent=t.button.textContent.replace("⇱","").trim(),h.appendChild(c);const m=document.createElement("div");m.className="detached-header-controls";const u=document.createElement("button");u.className="detached-reattach-btn",u.innerHTML="↩",u.title="Reattach to main panel",u.onclick=()=>this.reattachTab(t),m.appendChild(u),h.appendChild(m);const f=document.createElement("div");f.className="detached-tab-content",f.appendChild(t.content),t.content.style.display="block",t.content.classList.add("active");const w=document.createElement("div");w.className="detached-tab-resizer-top";const y=document.createElement("div");y.className="detached-tab-resizer-right";const v=document.createElement("div");v.className="detached-tab-resizer-bottom";const L=document.createElement("div");L.className="detached-tab-resizer-left";const T=document.createElement("div");return T.className="detached-tab-resizer",d.appendChild(w),d.appendChild(y),d.appendChild(v),d.appendChild(L),d.appendChild(T),d.appendChild(h),d.appendChild(f),document.body.appendChild(d),this.setupDetachedWindowDrag(d,h,t),this.setupDetachedWindowResize(d,w,y,v,L,T),d.style.setProperty("z-index",this.maxZIndex,"important"),{panel:d,tab:t}}bringWindowToFront(t){this.maxZIndex++,t.style.setProperty("z-index",this.maxZIndex,"important")}setupDetachedWindowDrag(t,e,i){let n=!1,s,r,o,a;t.addEventListener("pointerdown",()=>{this.bringWindowToFront(t)});const l=c=>{if(c.target.classList.contains("detached-reattach-btn"))return;this.bringWindowToFront(t),n=!0,e.style.cursor="grabbing",e.setPointerCapture(c.pointerId),s=c.clientX,r=c.clientY;const m=t.getBoundingClientRect();o=m.left,a=m.top},d=c=>{if(!n)return;c.preventDefault();const m=c.clientX,u=c.clientY,f=m-s,w=u-r;let y=o+f,v=a+w;const L=window.innerWidth,T=window.innerHeight,S=t.offsetWidth,k=t.offsetHeight,F=S/2,N=k/2;y+S>L+F&&(y=L+F-S),y<-F&&(y=-F),v+k>T+N&&(v=T+N-k),v<-N&&(v=-N),t.style.left=`${y}px`,t.style.top=`${v}px`;const I=this.panel.getBoundingClientRect();m>=I.left&&m<=I.right&&u>=I.top&&u<=I.bottom?(t.style.opacity="0.5",this.panel.style.outline="2px solid var(--accent-color)"):(t.style.opacity="",this.panel.style.outline="")},h=c=>{if(!n)return;n=!1,e.style.cursor="",t.style.opacity="",this.panel.style.outline="";const m=c.clientX,u=c.clientY;if(m!==void 0&&u!==void 0){const f=this.panel.getBoundingClientRect();m>=f.left&&m<=f.right&&u>=f.top&&u<=f.bottom&&i?this.reattachTab(i):this.saveLayout()}e.removeEventListener("pointermove",d),e.removeEventListener("pointerup",h),e.removeEventListener("pointercancel",h)};e.addEventListener("pointerdown",c=>{l(c),e.addEventListener("pointermove",d),e.addEventListener("pointerup",h),e.addEventListener("pointercancel",h)}),e.style.cursor="grab"}setupDetachedWindowResize(t,e,i,n,s,r){const l=(d,h)=>{let c=!1,m,u,f,w,y,v;const L=k=>{k.preventDefault(),k.stopPropagation(),c=!0,this.bringWindowToFront(t),d.setPointerCapture(k.pointerId),m=k.clientX,u=k.clientY,f=t.offsetWidth,w=t.offsetHeight,y=t.offsetLeft,v=t.offsetTop},T=k=>{if(!c)return;k.preventDefault();const F=k.clientX,N=k.clientY,I=F-m,D=N-u,ot=window.innerWidth,at=window.innerHeight;if(h==="right"||h==="corner"){const C=f+I,z=ot-y;C>=250&&C<=z&&(t.style.width=`${C}px`)}if(h==="bottom"||h==="corner"){const C=w+D,z=at-v;C>=150&&C<=z&&(t.style.height=`${C}px`)}if(h==="left"){const C=f-I,z=y+f-250;if(C>=250){const R=y+I;R>=0&&R<=z&&(t.style.width=`${C}px`,t.style.left=`${R}px`)}}if(h==="top"){const C=w-D,z=v+w-150;if(C>=150){const R=v+D;R>=0&&R<=z&&(t.style.height=`${C}px`,t.style.top=`${R}px`)}}},S=()=>{c=!1,d.removeEventListener("pointermove",T),d.removeEventListener("pointerup",S),d.removeEventListener("pointercancel",S),this.saveLayout()};d.addEventListener("pointerdown",k=>{L(k),d.addEventListener("pointermove",T),d.addEventListener("pointerup",S),d.addEventListener("pointercancel",S)})};l(e,"top"),l(i,"right"),l(n,"bottom"),l(s,"left"),l(r,"corner")}reattachTab(t){if(!t.isDetached)return;if(t.detachedWindow){const r=this.detachedWindows.indexOf(t.detachedWindow);r>-1&&this.detachedWindows.splice(r,1),t.detachedWindow.panel.parentNode&&t.detachedWindow.panel.parentNode.removeChild(t.detachedWindow.panel),t.detachedWindow=null}t.isDetached=!1;const i=Object.values(this.tabs).filter(r=>r.originalIndex!==void 0&&r.isVisible).sort((r,o)=>r.originalIndex-o.originalIndex),n=Array.from(this.tabsContainer.children);let s=0;for(const r of i){if(r.id===t.id)break;r.isDetached||s++}s>=n.length||n.length===0?this.tabsContainer.appendChild(t.button):this.tabsContainer.insertBefore(t.button,n[s]),this.contentWrapper.appendChild(t.content),this.setActiveTab(t.id),this.updatePanelSize(),this.saveLayout()}setActiveTab(t){this.activeTabId&&this.tabs[this.activeTabId]&&!this.tabs[this.activeTabId].isDetached&&this.tabs[this.activeTabId].setActive(!1),this.activeTabId=t,this.tabs[t]&&this.tabs[t].setActive(!0),this.saveLayout()}togglePanel(){this.panel.classList.toggle("visible"),this.toggleButton.classList.toggle("panel-open"),this.miniPanel.classList.toggle("panel-open");const t=this.panel.classList.contains("visible");this.detachedWindows.forEach(e=>{t?(e.panel.style.opacity="",e.panel.style.visibility="",e.panel.style.pointerEvents=""):(e.panel.style.opacity="0",e.panel.style.visibility="hidden",e.panel.style.pointerEvents="none")}),this.dispatchEvent({type:"resize"}),this.saveLayout()}togglePosition(){const t=this.position==="bottom"?"right":"bottom";this.setPosition(t)}setPosition(t){if(this.position===t)return;this.panel.style.transition="none";const e=this.panel.classList.contains("maximized");t==="right"?(this.position="right",this.floatingBtn.classList.add("active"),this.floatingBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 15h18"></path></svg>',this.floatingBtn.title="Switch to Bottom",this.panel.classList.remove("position-bottom"),this.panel.classList.add("position-right"),this.toggleButton.classList.add("position-right"),this.miniPanel.classList.add("position-right"),this.panel.style.bottom="",this.panel.style.top="0",this.panel.style.right="0",this.panel.style.left="",e?(this.panel.style.width="100vw",this.panel.style.height="100%"):(this.panel.style.width=`${this.lastWidthRight}px`,this.panel.style.height="100%")):(this.position="bottom",this.floatingBtn.classList.remove("active"),this.floatingBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>',this.floatingBtn.title="Switch to Right Side",this.panel.classList.remove("position-right"),this.panel.classList.add("position-bottom"),this.toggleButton.classList.remove("position-right"),this.miniPanel.classList.remove("position-right"),this.panel.style.top="",this.panel.style.right="",this.panel.style.bottom="0",this.panel.style.left="0",e?(this.panel.style.width="100%",this.panel.style.height="100vh"):(this.panel.style.width="100%",this.panel.style.height=`${this.lastHeightBottom}px`)),setTimeout(()=>{this.panel.style.transition=""},50),this.updatePanelSize(),this.saveLayout()}saveLayout(){if(this.isLoadingLayout)return;const t={position:this.position,lastHeightBottom:this.lastHeightBottom,lastWidthRight:this.lastWidthRight,activeTabId:this.activeTabId,detachedTabs:[],isVisible:this.panel.classList.contains("visible")};this.detachedWindows.forEach(e=>{const i=e.tab,n=e.panel,s=parseFloat(n.style.left)||n.offsetLeft||0,r=parseFloat(n.style.top)||n.offsetTop||0,o=n.offsetWidth,a=n.offsetHeight;t.detachedTabs.push({tabId:i.id,originalIndex:i.originalIndex!==void 0?i.originalIndex:0,left:s,top:r,width:o,height:a})});try{A("layout",t)}catch(e){console.warn("Failed to save profiler layout:",e)}}loadLayout(){this.isLoadingLayout=!0;try{const t=H("layout");if(Object.keys(t).length===0)return;if(t.detachedTabs&&t.detachedTabs.length>0){const n=window.innerWidth,s=window.innerHeight;t.detachedTabs=t.detachedTabs.map(r=>{let{left:o,top:a,width:l,height:d}=r;l>n&&(l=n-100),d>s&&(d=s-100);const h=l/2,c=d/2;return o+l>n+h&&(o=n+h-l),o<-h&&(o=-h),a+d>s+c&&(a=s+c-d),a<-c&&(a=-c),{...r,left:o,top:a,width:l,height:d}})}t.position&&(this.position=t.position),t.lastHeightBottom&&(this.lastHeightBottom=t.lastHeightBottom),t.lastWidthRight&&(this.lastWidthRight=t.lastWidthRight);const e=window.innerWidth,i=window.innerHeight;this.lastHeightBottom>i-50&&(this.lastHeightBottom=i-50),this.lastWidthRight>e-50&&(this.lastWidthRight=e-50),this.position==="right"?(this.floatingBtn.classList.add("active"),this.floatingBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 15h18"></path></svg>',this.floatingBtn.title="Switch to Bottom",this.panel.classList.remove("position-bottom"),this.panel.classList.add("position-right"),this.toggleButton.classList.add("position-right"),this.miniPanel.classList.add("position-right"),this.panel.style.bottom="",this.panel.style.top="0",this.panel.style.right="0",this.panel.style.left="",this.panel.style.width=`${this.lastWidthRight}px`,this.panel.style.height="100%"):this.panel.style.height=`${this.lastHeightBottom}px`,t.isVisible&&(this.panel.classList.add("visible"),this.toggleButton.classList.add("panel-open")),t.activeTabId&&this.setActiveTab(t.activeTabId),t.detachedTabs&&t.detachedTabs.length>0&&(this.pendingDetachedTabs=t.detachedTabs,this.restoreDetachedTabs()),this.updatePanelSize(),this.panel.classList.contains("visible")&&this.miniPanel.classList.add("panel-open")}catch(t){console.warn("Failed to load profiler layout:",t)}finally{this.isLoadingLayout=!1}}restoreDetachedTabs(){if(!this.pendingDetachedTabs||this.pendingDetachedTabs.length===0)return;if(this.pendingDetachedTabs.forEach(e=>{const i=this.tabs[e.tabId];if(!i||i.isDetached)return;e.originalIndex!==void 0&&(i.originalIndex=e.originalIndex),i.button.parentNode&&i.button.parentNode.removeChild(i.button),i.content.parentNode&&i.content.parentNode.removeChild(i.content);const n=this.createDetachedWindow(i,0,0);n.panel.style.left=`${e.left}px`,n.panel.style.top=`${e.top}px`,n.panel.style.width=`${e.width}px`,n.panel.style.height=`${e.height}px`,this.constrainWindowToBounds(n.panel),this.detachedWindows.push(n),i.isDetached=!0,i.detachedWindow=n}),this.pendingDetachedTabs=null,this.detachedWindows.forEach(e=>{const i=parseInt(getComputedStyle(e.panel).zIndex)||0;i>this.maxZIndex&&(this.maxZIndex=i)}),!this.activeTabId||!this.tabs[this.activeTabId]||this.tabs[this.activeTabId].isDetached||!this.tabs[this.activeTabId].isVisible){const i=Object.keys(this.tabs).filter(n=>!this.tabs[n].isDetached&&this.tabs[n].isVisible);if(i.length>0){const s=Array.from(this.tabsContainer.children).map(r=>Object.keys(this.tabs).find(o=>this.tabs[o].button===r)).filter(r=>r!==void 0&&!this.tabs[r].isDetached&&this.tabs[r].isVisible);this.setActiveTab(s[0]||i[0])}else this.activeTabId=null}this.updatePanelSize()}}class W extends ${constructor(t,e={}){super(),this.id=t.toLowerCase(),this.button=document.createElement("button"),this.button.className="tab-btn",this.button.textContent=t,this.content=document.createElement("div"),this.content.id=`${this.id}-content`,this.content.className="profiler-content",this._isActive=!1,this.isVisible=!0,this.isDetached=!1,this.detachedWindow=null,this.allowDetach=e.allowDetach!==void 0?e.allowDetach:!0,this.builtin=e.builtin!==void 0?e.builtin:!1,this.icon=e.icon||null,this.builtinButton=null,this.miniContent=null,this.profiler=null,this.onVisibilityChange=null}get inspector(){return this.profiler.inspector}get isActive(){return this.profiler&&this.profiler.panel.classList.contains("visible")?this.isDetached||this._isActive:!1}set isActive(t){this._isActive=t}init(){}update(){}setActive(t){this.button.classList.toggle("active",t),this.content.classList.toggle("active",t),this.isActive=t}show(){this.content.style.display="",this.button.style.display="",this.isVisible=!0,this.isDetached&&this.detachedWindow&&(this.detachedWindow.panel.style.display=""),this.onVisibilityChange&&this.onVisibilityChange(),this.showBuiltin()}hide(){this.content.style.display="none",this.button.style.display="none",this.isVisible=!1,this.isDetached&&this.detachedWindow&&(this.detachedWindow.panel.style.display="none"),this.onVisibilityChange&&this.onVisibilityChange(),this.hideBuiltin()}showBuiltin(){if(this.builtin&&(this.profiler&&this.profiler.builtinTabsContainer&&(this.profiler.builtinTabsContainer.style.display=""),this.builtinButton&&(this.builtinButton.style.display=""),this.miniContent&&this.profiler)){if(this.profiler.miniPanel.querySelectorAll(".mini-panel-content").forEach(t=>{t.style.display="none"}),this.profiler.builtinTabsContainer.querySelectorAll(".builtin-tab-btn").forEach(t=>{t.classList.remove("active")}),this.builtinButton&&this.builtinButton.classList.add("active"),!this.miniContent.firstChild)for(;this.content.firstChild;)this.miniContent.appendChild(this.content.firstChild);this.miniContent.style.display="block",this.profiler.miniPanel.classList.add("visible")}}hideBuiltin(){if(this.builtin){if(this.builtinButton&&(this.builtinButton.style.display="none"),this.miniContent&&(this.miniContent.style.display="none",this.miniContent.firstChild))for(;this.miniContent.firstChild;)this.content.appendChild(this.miniContent.firstChild);this.builtinButton&&this.builtinButton.classList.remove("active"),this.profiler&&(Array.from(this.profiler.miniPanel.querySelectorAll(".mini-panel-content")).some(i=>i.style.display!=="none")||this.profiler.miniPanel.classList.remove("visible"),Array.from(this.profiler.builtinTabsContainer.querySelectorAll(".builtin-tab-btn")).some(i=>i.style.display!=="none")||(this.profiler.builtinTabsContainer.style.display="none"))}}}class O{constructor(...t){this.headers=t,this.children=[],this.domElement=document.createElement("div"),this.domElement.className="list-container",this.domElement.style.padding="10px",this.id=`list-${Math.random().toString(36).slice(2,11)}`,this.domElement.dataset.listId=this.id,this.gridStyleElement=document.createElement("style"),this.domElement.appendChild(this.gridStyleElement);const e=document.createElement("div");e.className="list-header",this.headers.forEach(i=>{const n=document.createElement("div");n.className="list-header-cell",n.textContent=i,e.appendChild(n)}),this.domElement.appendChild(e)}setGridStyle(t){this.gridStyleElement.textContent=`
[data-list-id="${this.id}"] > .list-header,
[data-list-id="${this.id}"] .list-item-row {
	grid-template-columns: ${t};
}
`}add(t){t.parent!==null&&t.parent.remove(t),t.domElement.classList.add("header-wrapper","section-start"),t.parent=this,this.children.push(t),this.domElement.appendChild(t.domElement)}remove(t){const e=this.children.indexOf(t);return e!==-1&&(this.children.splice(e,1),this.domElement.removeChild(t.domElement),t.parent=null),this}}class _{constructor(t=512){this.maxPoints=t,this.lines={},this.limit=0,this.limitIndex=0,this.domElement=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.domElement.setAttribute("class","graph-svg")}addLine(t,e){const i=document.createElementNS("http://www.w3.org/2000/svg","path");i.setAttribute("class","graph-path"),i.style.stroke=e,i.style.fill=e,this.domElement.appendChild(i),this.lines[t]={path:i,color:e,points:[]}}addPoint(t,e){const i=this.lines[t];i&&(i.points.push(e),i.points.length>this.maxPoints&&i.points.shift(),e>this.limit&&(this.limit=e,this.limitIndex=0))}resetLimit(){this.limit=0,this.limitIndex=0}update(){const t=this.domElement.clientWidth,e=this.domElement.clientHeight;if(t===0)return;const i=t/(this.maxPoints-1);for(const n in this.lines){const s=this.lines[n];let r=`M 0,${e}`;for(let a=0;a<s.points.length;a++){const l=a*i,d=e-s.points[a]/this.limit*e;r+=` L ${l},${d}`}r+=` L ${(s.points.length-1)*i},${e} Z`;const o=t-(s.points.length-1)*i;s.path.setAttribute("transform",`translate(${o}, 0)`),s.path.setAttribute("d",r)}this.limitIndex++>this.maxPoints&&this.resetLimit()}}class x{constructor(...t){this.children=[],this.isOpen=!0,this.childrenContainer=null,this.parent=null,this.domElement=document.createElement("div"),this.domElement.className="list-item-wrapper",this.itemRow=document.createElement("div"),this.itemRow.className="list-item-row",this.userData={},this.data=t,this.data.forEach(e=>{const i=document.createElement("div");i.className="list-item-cell",e instanceof HTMLElement?i.appendChild(e):i.append(String(e)),this.itemRow.appendChild(i)}),this.domElement.appendChild(this.itemRow),this.onItemClick=this.onItemClick.bind(this)}onItemClick(t){t.target.closest("button, a, input, label")||this.toggle()}add(t,e=this.children.length){return t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.splice(e,0,t),this.itemRow.classList.add("collapsible"),this.childrenContainer||(this.childrenContainer=document.createElement("div"),this.childrenContainer.className="list-children-container",this.childrenContainer.classList.toggle("closed",!this.isOpen),this.domElement.appendChild(this.childrenContainer),this.itemRow.addEventListener("click",this.onItemClick)),this.childrenContainer.insertBefore(t.domElement,this.childrenContainer.children[e]||null),this.updateToggler(),this}remove(t){const e=this.children.indexOf(t);return e!==-1&&(this.children.splice(e,1),this.childrenContainer.removeChild(t.domElement),t.parent=null,this.children.length===0&&(this.itemRow.classList.remove("collapsible"),this.itemRow.removeEventListener("click",this.onItemClick),this.childrenContainer.remove(),this.childrenContainer=null),this.updateToggler()),this}updateToggler(){const t=this.itemRow.querySelector(".list-item-cell:first-child");let e=this.itemRow.querySelector(".item-toggler");this.children.length>0?(e||(e=document.createElement("span"),e.className="item-toggler",t.prepend(e)),this.isOpen&&this.itemRow.classList.add("open")):e&&e.remove()}toggle(){return this.isOpen=!this.isOpen,this.itemRow.classList.toggle("open",this.isOpen),this.childrenContainer&&this.childrenContainer.classList.toggle("closed",!this.isOpen),this}close(){return this.isOpen&&this.toggle(),this}}function g(p=null){const t=document.createElement("span");return t.className="value",p!==null&&(t.id=p),t}function b(p,t){const e=p instanceof HTMLElement?p:document.getElementById(p);e&&e.textContent!==t&&(e.textContent=t)}function Kt(p){const t=p.lastIndexOf("/");if(t===-1)return{path:"",name:p.trim()};const e=p.substring(0,t).trim(),i=p.substring(t+1).trim();return{path:e,name:i}}function te(p){return p.replace(/([a-z0-9])([A-Z])/g,"$1 $2").trim()}function B(p,t=2){if(p===0)return"0 Bytes";const e=1024,i=t<0?0:t,n=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],s=Math.floor(Math.log(p)/Math.log(e));return parseFloat((p/Math.pow(e,s)).toFixed(i))+" "+n[s]}class ee extends W{constructor(t={}){super("Performance",t);const e=new O("Name","CPU","GPU","Total");e.setGridStyle("minmax(200px, 2fr) 80px 80px 80px"),e.domElement.style.minWidth="600px";const i=document.createElement("div");i.className="list-scroll-wrapper",i.appendChild(e.domElement),this.content.appendChild(i);const n=document.createElement("div");n.className="graph-container";const s=new _;s.addLine("fps","var( --color-fps )"),n.append(s.domElement);const r=new x("Graph Stats",g(),g(),g("graph-fps-counter"));e.add(r);const o=new x(n);o.itemRow.childNodes[0].style.gridColumn="1 / -1",r.add(o);const a=new x("Frame Stats",g(),g(),g());e.add(a);const l=new x("Miscellaneous & Idle",g(),g(),g());l.domElement.firstChild.style.backgroundColor="#00ff0b1a",l.domElement.firstChild.classList.add("no-hover"),a.add(l),this.notInUse=new Map,this.frameStats=a,this.graphStats=r,this.graph=s,this.miscellaneous=l,this.currentRender=null,this.currentItem=null,this.frameItems=new Map}resolveStats(t,e){const i=t.getStatsData(e.cid);let n=i.item;if(n===void 0)n=new x(g(),g(),g(),g()),e.name?e.isComputeStats===!0&&(e.name=`${e.name} [ Compute ]`):e.name=`Unnamed ${e.cid}`,n.userData.name=e.name,this.currentItem.add(n),i.item=n;else{n.userData.name=e.name,this.notInUse.has(e.cid)&&(n.domElement.firstElementChild.classList.remove("alert"),this.notInUse.delete(e.cid));const o=e.parent.children.indexOf(e);(n.parent===null||n.parent.children.indexOf(n)!==o)&&this.currentItem.add(n,o)}let s=n.userData.name;e.isComputeStats&&(s+=" [ Compute ]"),b(n.data[0],s),b(n.data[1],i.cpu.toFixed(2)),b(n.data[2],e.gpuNotAvailable===!0?"-":i.gpu.toFixed(2)),b(n.data[3],i.total.toFixed(2));const r=this.currentItem;this.currentItem=n;for(const o of e.children)this.resolveStats(t,o);this.currentItem=r,this.frameItems.set(e.cid,n)}updateGraph(t){this.graph.addPoint("fps",t.fps),this.graph.update()}addNotInUse(t,e){e.domElement.firstElementChild.classList.add("alert"),this.notInUse.set(t,{item:e,time:performance.now()}),this.updateNotInUse(t)}updateNotInUse(t){const{item:e,time:i}=this.notInUse.get(t),n=performance.now(),r=5-Math.floor((n-i)/1e3);if(r>=0){const o="*".repeat(Math.max(0,r)),a=e.domElement.querySelector(".list-item-cell .value");b(a,e.userData.name+" (not in use) "+o)}else e.domElement.firstElementChild.classList.remove("alert"),e.parent.remove(e),this.notInUse.delete(t)}updateText(t,e){const i=new Map(this.frameItems);this.frameItems.clear(),this.currentItem=this.frameStats;for(const n of e.children)this.resolveStats(t,n);for(const[n,s]of i)this.frameItems.has(n)||(this.addNotInUse(n,s),i.delete(n));for(const n of this.notInUse.keys())this.updateNotInUse(n);b("graph-fps-counter",t.fps.toFixed()+" FPS"),b(this.frameStats.data[1],e.cpu.toFixed(2)),b(this.frameStats.data[2],e.gpu.toFixed(2)),b(this.frameStats.data[3],e.total.toFixed(2)),b(this.miscellaneous.data[1],e.miscellaneous.toFixed(2)),b(this.miscellaneous.data[2],"-"),b(this.miscellaneous.data[3],e.miscellaneous.toFixed(2)),this.currentItem=null}}class ie extends W{constructor(t={}){super("Memory",t);const e=new O("Name","Count","Size");e.setGridStyle("minmax(200px, 2fr) 60px 100px"),e.domElement.style.minWidth="300px";const i=document.createElement("div");i.className="list-scroll-wrapper",i.appendChild(e.domElement),this.content.appendChild(i);const n=document.createElement("div");n.className="graph-container";const s=new _;s.addLine("total","var( --color-yellow )"),n.append(s.domElement);const r=new x("Graph Stats","","");e.add(r);const o=new x(n);o.itemRow.childNodes[0].style.gridColumn="1 / -1",r.add(o),this.memoryStats=new x("Renderer Info","",g()),this.memoryStats.domElement.firstChild.classList.add("no-hover"),e.add(this.memoryStats),this.attributes=new x("Attributes",g(),g()),this.memoryStats.add(this.attributes),this.geometries=new x("Geometries",g(),"N/A"),this.memoryStats.add(this.geometries),this.indexAttributes=new x("Index Attributes",g(),g()),this.memoryStats.add(this.indexAttributes),this.indirectStorageAttributes=new x("Indirect Storage Attributes",g(),g()),this.memoryStats.add(this.indirectStorageAttributes),this.programs=new x("Programs",g(),g()),this.memoryStats.add(this.programs),this.readbackBuffers=new x("Readback Buffers",g(),g()),this.memoryStats.add(this.readbackBuffers),this.renderTargets=new x("Render Targets",g(),"N/A"),this.memoryStats.add(this.renderTargets),this.storageAttributes=new x("Storage Attributes",g(),g()),this.memoryStats.add(this.storageAttributes),this.textures=new x("Textures",g(),g()),this.memoryStats.add(this.textures),this.graph=s}updateGraph(t){const e=t.getRenderer();if(!e)return;const i=e.info.memory;this.graph.addPoint("total",i.total),this.graph.limit===0&&(this.graph.limit=1),this.graph.update()}updateText(t){const e=t.getRenderer();if(!e)return;const i=e.info.memory;b(this.memoryStats.data[2],B(i.total)),b(this.attributes.data[1],i.attributes.toString()),b(this.attributes.data[2],B(i.attributesSize)),b(this.geometries.data[1],i.geometries.toString()),b(this.indexAttributes.data[1],i.indexAttributes.toString()),b(this.indexAttributes.data[2],B(i.indexAttributesSize)),b(this.indirectStorageAttributes.data[1],i.indirectStorageAttributes.toString()),b(this.indirectStorageAttributes.data[2],B(i.indirectStorageAttributesSize)),b(this.programs.data[1],i.programs.toString()),b(this.programs.data[2],B(i.programsSize)),b(this.readbackBuffers.data[1],i.readbackBuffers.toString()),b(this.readbackBuffers.data[2],B(i.readbackBuffersSize)),b(this.renderTargets.data[1],i.renderTargets.toString()),b(this.storageAttributes.data[1],i.storageAttributes.toString()),b(this.storageAttributes.data[2],B(i.storageAttributesSize)),b(this.textures.data[1],i.textures.toString()),b(this.textures.data[2],B(i.texturesSize))}}class ne extends W{constructor(t={}){super("Console",t),this.filters={info:!0,warn:!0,error:!0},this.filterText="",this.buildHeader(),this.logContainer=document.createElement("div"),this.logContainer.id="console-log",this.content.appendChild(this.logContainer)}buildHeader(){const t=document.createElement("div");t.className="console-header";const e=document.createElement("input");e.type="text",e.className="console-filter-input",e.placeholder="Filter...",e.addEventListener("input",s=>{this.filterText=s.target.value.toLowerCase(),this.applyFilters()});const i=document.createElement("button");i.className="console-copy-button",i.title="Copy all",i.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',i.addEventListener("click",()=>this.copyAll(i));const n=document.createElement("div");n.className="console-buttons-group",Object.keys(this.filters).forEach(s=>{const r=document.createElement("label");r.className="custom-checkbox",r.style.color=`var(--${s==="info"?"text-primary":"color-"+(s==="warn"?"yellow":"red")})`;const o=document.createElement("input");o.type="checkbox",o.checked=this.filters[s],o.dataset.type=s;const a=document.createElement("span");a.className="checkmark",r.appendChild(o),r.appendChild(a),r.append(s.charAt(0).toUpperCase()+s.slice(1)),n.appendChild(r)}),n.addEventListener("change",s=>{const r=s.target.dataset.type;r in this.filters&&(this.filters[r]=s.target.checked,this.applyFilters())}),n.appendChild(i),t.appendChild(e),t.appendChild(n),this.content.appendChild(t)}applyFilters(){this.logContainer.querySelectorAll(".log-message").forEach(e=>{const i=e.dataset.type,n=e.dataset.rawText.toLowerCase(),s=this.filters[i],r=n.includes(this.filterText);e.classList.toggle("hidden",!(s&&r))})}copyAll(t){const i=this.logContainer.ownerDocument.defaultView.getSelection(),n=i.toString(),s=n&&this.logContainer.contains(i.anchorNode);let r;if(s)r=n;else{const o=this.logContainer.querySelectorAll(".log-message:not(.hidden)");r=Array.from(o).map(a=>a.dataset.rawText).join(`
`)}navigator.clipboard.writeText(r),t.classList.add("copied"),setTimeout(()=>t.classList.remove("copied"),350)}_getIcon(t,e){let i;return e==="tip"?i="💭":e==="tsl"?i="✨":e==="webgpurenderer"?i="🎨":t==="warn"?i="⚠️":t==="error"?i="🔴":t==="info"&&(i="ℹ️"),i}_formatMessage(t,e){const i=document.createDocumentFragment(),n=e.match(/^([\w\.]+:\s)/);let s=e;if(n){const o=n[0],a=o.slice(0,-2).split("."),l=(a.length>1?a[a.length-1]:a[0])+":",d=this._getIcon(t,l.split(":")[0].toLowerCase());i.appendChild(document.createTextNode(d+" "));const h=document.createElement("span");h.className="log-prefix",h.textContent=l,i.appendChild(h),s=e.substring(o.length)}const r=s.split(/(".*?"|'.*?'|`.*?`)/g).map(o=>o.trim()).filter(Boolean);return r.forEach((o,a)=>{if(/^("|'|`)/.test(o)){const l=document.createElement("span");l.className="log-code",l.textContent=o.slice(1,-1),i.appendChild(l)}else a>0&&(o=" "+o),a<r.length-1&&(o+=" "),i.appendChild(document.createTextNode(o))}),i}addMessage(t,e){const i=document.createElement("div");i.className=`log-message ${t}`,i.dataset.type=t,i.dataset.rawText=e,i.appendChild(this._formatMessage(t,e));const n=this.filters[t],s=e.toLowerCase().includes(this.filterText);i.classList.toggle("hidden",!(n&&s)),this.logContainer.appendChild(i),this.logContainer.scrollTop=this.logContainer.scrollHeight,this.logContainer.children.length>200&&this.logContainer.removeChild(this.logContainer.firstChild)}}class M extends ${constructor(){super(),this.domElement=document.createElement("div"),this.domElement.className="param-control",this._onChangeFunction=null,this.addEventListener("change",t=>{requestAnimationFrame(()=>{this._onChangeFunction&&this._onChangeFunction(t.value)})})}setValue(){return this.dispatchChange(),this}getValue(){return null}dispatchChange(){this.dispatchEvent({type:"change",value:this.getValue()})}onChange(t){return this._onChangeFunction=t,this}}class it extends M{constructor({value:t=0,step:e=.1,min:i=-1/0,max:n=1/0}){super(),this.input=document.createElement("input"),this.input.type="number",this.input.value=t,this.input.step=e,this.input.min=i,this.input.max=n,this.input.addEventListener("change",this._onChangeValue.bind(this)),this.domElement.appendChild(this.input),this.addDragHandler()}_onChangeValue(){const t=parseFloat(this.input.value),e=parseFloat(this.input.min),i=parseFloat(this.input.max);t>i?this.input.value=i:t<e?this.input.value=e:isNaN(t)&&(this.input.value=e),this.dispatchChange()}addDragHandler(){let t=!1,e,i;this.input.addEventListener("mousedown",n=>{t=!0,e=n.clientY,i=parseFloat(this.input.value),document.body.style.cursor="ns-resize"}),document.addEventListener("mousemove",n=>{if(t){const s=e-n.clientY,r=parseFloat(this.input.step)||1,o=parseFloat(this.input.min),a=parseFloat(this.input.max);let l=r;!isNaN(a)&&isFinite(o)&&(l=(a-o)/100);const d=s*l;let h=i+d;h=Math.max(o,Math.min(h,a));const c=(String(r).split(".")[1]||[]).length;this.input.value=h.toFixed(c),this.input.dispatchEvent(new Event("input")),this.dispatchChange()}}),document.addEventListener("mouseup",()=>{t&&(t=!1,document.body.style.cursor="default")})}setValue(t){return this.input.value=t,super.setValue(t)}getValue(){return parseFloat(this.input.value)}}class se extends M{constructor({value:t=!1}){super();const e=document.createElement("label");e.className="custom-checkbox";const i=document.createElement("input");i.type="checkbox",i.checked=t,this.checkbox=i;const n=document.createElement("span");n.className="checkmark",e.appendChild(i),e.appendChild(n),this.domElement.appendChild(e),i.addEventListener("change",()=>{this.dispatchChange()})}setValue(t){return this.checkbox.checked=t,super.setValue(t)}getValue(){return this.checkbox.checked}}class re extends M{constructor({value:t=0,min:e=0,max:i=1,step:n=.01}){super(),this.slider=document.createElement("input"),this.slider.type="range",this.slider.min=e,this.slider.max=i,this.slider.step=n;const s=new it({value:t,min:e,max:i,step:n});this.numberInput=s.input,this.numberInput.style.flexBasis="80px",this.numberInput.style.flexShrink="0",this.slider.value=t,this.domElement.append(this.slider,this.numberInput),this.slider.addEventListener("input",()=>{this.numberInput.value=this.slider.value,this.dispatchChange()}),s.addEventListener("change",()=>{this.slider.value=parseFloat(this.numberInput.value),this.dispatchChange()})}setValue(t){return this.slider.value=t,this.numberInput.value=t,super.setValue(t)}getValue(){return parseFloat(this.slider.value)}step(t){return this.slider.step=t,this.numberInput.step=t,this}}class oe extends M{constructor({options:t=[],value:e=""}){super();const i=document.createElement("select"),n=(s,r)=>{const o=document.createElement("option");return o.value=s,o.textContent=s,r==e&&(o.selected=!0),i.appendChild(o),o};Array.isArray(t)?t.forEach(s=>n(s,s)):Object.entries(t).forEach(([s,r])=>n(s,r)),this.domElement.appendChild(i),i.addEventListener("change",()=>{this.dispatchChange()}),this.options=t,this.select=i}getValue(){const t=this.options;return Array.isArray(t)?t[this.select.selectedIndex]:t[this.select.value]}}class ae extends M{constructor({value:t="#ffffff"}){super();const e=document.createElement("input");e.type="color",e.value=this._getColorHex(t),this.colorInput=e,this._value=t,e.addEventListener("input",()=>{const i=e.value;this._value.isColor?this._value.setHex(parseInt(i.slice(1),16)):this._value=i,this.dispatchChange()}),this.domElement.appendChild(e)}_getColorHex(t){return t.isColor&&(t=t.getHex()),typeof t=="number"?t=`#${t.toString(16)}`:t[0]!=="#"&&(t="#"+t),t}getValue(){let t=this._value;return typeof t=="string"&&(t=parseInt(t.slice(1),16)),t}}class le extends M{constructor({text:t="Button",value:e=()=>{}}){super();const i=document.createElement("button");i.textContent=t,i.onclick=e,this.domElement.appendChild(i)}}class de extends M{constructor({value:t=""}){super();const e=document.createElement("input");e.type="text",e.value=t,this.input=e,e.addEventListener("input",()=>{this.dispatchChange()}),this.domElement.appendChild(e)}setValue(t){return this.input.value=t,super.setValue(t)}getValue(){return this.input.value}}class G{constructor(t,e){this.parameters=t,this.name=e,this.paramList=new x(e),this.objects=[]}close(){return this.paramList.close(),this}add(t,e,...i){const s=typeof t[e];let r=null;return typeof i[0]=="object"?r=this.addSelect(t,e,i[0]):s==="number"?i.length>=2?r=this.addSlider(t,e,...i):r=this.addNumber(t,e,...i):s==="boolean"?r=this.addBoolean(t,e):s==="string"?r=this.addString(t,e):s==="function"&&(r=this.addButton(t,e,...i)),r}_addParameter(t,e,i,n){i.name=s=>(n.data[0].textContent=s,i),i.listen=()=>{const s=()=>{const r=i.getValue(),o=t[e];r!==o&&i.setValue(o),requestAnimationFrame(s)};return requestAnimationFrame(s),i},this._registerParameter(t,e,i,n)}_registerParameter(t,e,i,n){this.objects.push({object:t,key:e,editor:i,subItem:n})}addString(t,e){const i=t[e],n=new de({value:i});n.addEventListener("change",({value:a})=>{t[e]=a});const s=g();s.textContent=e;const r=new x(s,n.domElement);return this.paramList.add(r),r.domElement.firstChild.classList.add("actionable"),this._addParameter(t,e,n,r),n}addFolder(t){const e=new G(this.parameters,t);return this.paramList.add(e.paramList),e}addBoolean(t,e){const i=t[e],n=new se({value:i});n.addEventListener("change",({value:a})=>{t[e]=a});const s=g();s.textContent=e;const r=new x(s,n.domElement);this.paramList.add(r);const o=r.domElement.firstChild;return o.classList.add("actionable"),o.addEventListener("click",a=>{if(a.target.closest("label"))return;const l=o.querySelector('input[type="checkbox"]');l&&(l.checked=!l.checked,l.dispatchEvent(new Event("change")))}),this._addParameter(t,e,n,r),n}addSelect(t,e,i){const n=t[e],s=new oe({options:i,value:n});s.addEventListener("change",({value:l})=>{t[e]=l});const r=g();r.textContent=e;const o=new x(r,s.domElement);return this.paramList.add(o),o.domElement.firstChild.classList.add("actionable"),this._addParameter(t,e,s,o),s}addColor(t,e){const i=t[e],n=new ae({value:i});n.addEventListener("change",({value:a})=>{t[e]=a});const s=g();s.textContent=e;const r=new x(s,n.domElement);return this.paramList.add(r),r.domElement.firstChild.classList.add("actionable"),this._addParameter(t,e,n,r),n}addSlider(t,e,i=0,n=1,s=.01){const r=t[e],o=new re({value:r,min:i,max:n,step:s});o.addEventListener("change",({value:h})=>{t[e]=h});const a=g();a.textContent=e;const l=new x(a,o.domElement);return this.paramList.add(l),l.domElement.firstChild.classList.add("actionable"),this._addParameter(t,e,o,l),o}addNumber(t,e,...i){const n=t[e],[s,r]=i,o=new it({value:n,min:s,max:r});o.addEventListener("change",({value:h})=>{t[e]=h});const a=g();a.textContent=e;const l=new x(a,o.domElement);return this.paramList.add(l),l.domElement.firstChild.classList.add("actionable"),this._addParameter(t,e,o,l),o}addButton(t,e){const i=t[e],n=new le({text:e,value:i});n.addEventListener("change",({value:o})=>{t[e]=o});const s=new x(n.domElement);return s.itemRow.childNodes[0].style.gridColumn="1 / -1",this.paramList.add(s),s.domElement.firstChild.classList.add("actionable"),n.name=o=>(n.domElement.childNodes[0].textContent=o,n),this._registerParameter(t,e,n,s),n}}class nt extends W{constructor(t={}){super(t.name||"Parameters",t);const e=new O("Property","Value");e.domElement.classList.add("parameters"),e.setGridStyle(".5fr 1fr"),e.domElement.style.minWidth="300px";const i=document.createElement("div");i.className="list-scroll-wrapper",i.appendChild(e.domElement),this.content.appendChild(i),this.paramList=e,this.groups=[]}createGroup(t){const e=new G(this,t);return this.paramList.add(e.paramList),this.groups.push(e),e}}const q="../extensions/extensions.json",Z=U.prototype.init;function st(p){p?U.prototype.init=async function(){if(this.backend.isWebGLBackend!==!0){const t=this.backend.parameters;this.backend=new ct(t)}return Z.call(this)}:U.prototype.init=Z}let E=null;function rt(){if(E!==null)return E;const p=H("settings");return E={forceWebGL:p.forceWebGL!==void 0?p.forceWebGL:!1,captureStackTrace:p.captureStackTrace!==void 0?p.captureStackTrace:!1,activeExtensions:p.activeExtensions!==void 0?p.activeExtensions:{}},E.forceWebGL&&st(!0),E.captureStackTrace&&(K.captureStackTrace=!0),E}function j(){A("settings",{forceWebGL:E.forceWebGL,captureStackTrace:E.captureStackTrace,activeExtensions:E.activeExtensions})}rt();class ce extends nt{constructor(){super({name:"Settings"}),this.extensions={};const t=rt(),e=this.createGroup("Renderer");e.add(t,"forceWebGL").name("Force WebGL").onChange(i=>{st(i),j(),location.reload()}),e.add(t,"captureStackTrace").name("Capture Stack Trace").onChange(i=>{K.captureStackTrace=i,j(),location.reload()})}init(){const t=this.createGroup("Extensions");this._getExtensions().then(e=>{for(const i of e)i.active=!1,i.loaded=!1,i.tab=null,this.extensions[i.name]=i,i.ui=t.add({[i.name]:!1},i.name).onChange(async n=>{this.setActiveExtension(i.name,n),n?E.activeExtensions[i.name]={name:i.name,url:i.url}:delete E.activeExtensions[i.name],this._updateExtensionUI(i),j()}),E.activeExtensions[i.name]!==void 0&&i.ui.setValue(!0)})}async setActiveExtension(t,e){const i=this.extensions[t],n=this.inspector;i&&(e?await this._loadExtension(n,i):await this._unloadExtension(n,i))}_updateExtensionUI(t){t.active&&E.activeExtensions[t.name]===void 0?(t.ui.checkbox.checked=!0,t.ui.domElement.style.setProperty("--accent-color","var(--color-green)")):t.ui.domElement.style.removeProperty("--accent-color")}async _unloadExtension(t,e){e.active!==!1&&(t.removeTab(e.tab),e.active=!1,e.loaded=!1,e.tab=null,this._updateExtensionUI(e),this.dispatchEvent({type:"extensionremoved",name:e.name}))}async _loadExtension(t,e){if(e.active===!0)return;e.active=!0;const n=await import(new URL(e.url,new URL(q,import.meta.url)).href),s=Object.keys(n),r=n[s[0]],o=new r;t.addTab(o),e.loaded=!0,e.tab=o,this._updateExtensionUI(e),this.dispatchEvent({type:"extensionadded",name:e.name,tab:o})}async _getExtensions(){const t=new URL(q,import.meta.url);return await fetch(t).then(i=>i.json())}}const he=pt(([p,t])=>{const e=yt(0);vt(()=>{const{width:o,height:a}=t.value;e.value=o/a});const i=p.sub(.5),s=wt(i.x.div(e),i.y).add(.5),r=V(0,s.x).mul(V(s.x,1)).mul(V(0,s.y)).mul(V(s.y,1));return tt(s,r)});class pe extends W{constructor(t={}){super("Viewer",t);const e=new O("Viewer","Name");e.setGridStyle("150px minmax(200px, 2fr)"),e.domElement.style.minWidth="400px";const i=document.createElement("div");i.className="list-scroll-wrapper",i.appendChild(e.domElement),this.content.appendChild(i);const n=new x("Nodes");e.add(n),this.itemLibrary=new Map,this.folderLibrary=new Map,this.canvasNodes=new Map,this.currentDataList=[],this.nodeList=e,this.nodes=n}getFolder(t){let e=this.folderLibrary.get(t);return e===void 0&&(e=new x(t),this.folderLibrary.set(t,e),this.nodeList.add(e)),e}addNodeItem(t){let e=this.itemLibrary.get(t.id);if(e===void 0){const i=t.name,n=t.canvasTarget.domElement;e=new x(n,i),e.itemRow.children[1].style["justify-content"]="flex-start",this.itemLibrary.set(t.id,e)}return e}getCanvasDataByNode(t,e){let i=this.canvasNodes.get(e);if(i===void 0){const n=document.createElement("canvas"),s=new ht(n);s.setPixelRatio(window.devicePixelRatio),s.setSize(140,140);const r=e.id,{path:o,name:a}=Kt(te(e.getName()||"(unnamed)")),l=e.context({getUV:m=>{const u=he(mt,m),f=u.xy,w=u.z;return f.mul(w)}});let d=ut(tt(l),1);d=gt(d,X,t.outputColorSpace),d=d.context({inspector:!0});const h=new ft;h.outputNode=d;const c=new bt(h);c.name="Viewer - "+a,i={id:r,name:a,path:o,node:e,quad:c,canvasTarget:s,material:h},this.canvasNodes.set(e,i)}return i}update(t){const e=t.getRenderer(),i=t.getNodes();if(i.length>0){if(!e.backend.isWebGPUBackend){t.resolveConsoleOnce("warn","Inspector: Viewer is only available with WebGPU.");return}this.isVisible||this.show()}if(!this.isActive)return;const n=i.map(o=>this.getCanvasDataByNode(e,o)),s=[...this.currentDataList];for(const o of s)if(this.itemLibrary.has(o.id)&&n.indexOf(o)===-1){const a=this.itemLibrary.get(o.id),l=a.parent;l.remove(a),this.folderLibrary.has(l.data[0])&&l.children.length===0&&(l.parent.remove(l),this.folderLibrary.delete(l.data[0])),this.itemLibrary.delete(o.id)}const r={};for(const o of n){const a=this.addNodeItem(o),l=e.getCanvasTarget(),d=o.path;if(d){const c=this.getFolder(d);r[d]===void 0&&(r[d]=0),(c.parent===null||a.parent!==c||c.children.indexOf(a)!==r[d])&&c.add(a),r[d]++}else a.parent||this.nodes.add(a);this.currentDataList=n;const h=Y.resetRendererState(e);e.toneMapping=X,e.outputColorSpace=xt,e.setCanvasTarget(o.canvasTarget),o.quad.render(e),e.setCanvasTarget(l),Y.restoreRendererState(e,h)}}}const J=500,Q=60;class me extends W{constructor(t={}){super("Timeline",t),this.isRecording=!1,this.frames=[],this.baseTriangles=0,this.currentFrame=null,this.isHierarchicalView=!0,this.callBlocks=new WeakMap,this.fallbackBlocks=[],this.originalBackend=null,this.originalMethods=new Map,this.renderer=null,this.graph=new _(J),this.graph.addLine("fps","var( --color-fps )"),this.graph.addLine("calls","var( --color-call )"),this.graph.addLine("triangles","var( --color-red )");const e=document.createElement("div");e.className="list-scroll-wrapper",this.scrollWrapper=e,this.content.appendChild(e),this.buildHeader(),this.buildUI(),window.addEventListener("resize",()=>{!this.isRecording&&this.frames.length>0&&this.renderSlider()})}buildHeader(){const t=document.createElement("div");t.className="console-header",this.recordButton=document.createElement("button"),this.recordButton.className="console-copy-button",this.recordButton.title="Record",this.recordButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>',this.recordButton.style.padding="0 10px",this.recordButton.style.lineHeight="24px",this.recordButton.style.display="flex",this.recordButton.style.alignItems="center",this.recordButton.addEventListener("click",()=>this.toggleRecording());const e=document.createElement("button");e.className="console-copy-button",e.title="Clear",e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',e.style.padding="0 10px",e.style.lineHeight="24px",e.style.display="flex",e.style.alignItems="center",e.addEventListener("click",()=>this.clear()),this.viewModeButton=document.createElement("button"),this.viewModeButton.className="console-copy-button",this.viewModeButton.title="Toggle View Mode",this.viewModeButton.textContent="Mode: Hierarchy",this.viewModeButton.style.padding="0 10px",this.viewModeButton.style.lineHeight="24px",this.viewModeButton.addEventListener("click",()=>{this.isHierarchicalView=!this.isHierarchicalView,this.viewModeButton.textContent=this.isHierarchicalView?"Mode: Hierarchy":"Mode: Counts",this.selectedFrameIndex!==void 0&&this.selectedFrameIndex!==-1&&this.selectFrame(this.selectedFrameIndex)}),this.recordRefreshButton=document.createElement("button"),this.recordRefreshButton.className="console-copy-button",this.recordRefreshButton.title="Refresh & Record",this.recordRefreshButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>',this.recordRefreshButton.style.padding="0 10px",this.recordRefreshButton.style.lineHeight="24px",this.recordRefreshButton.style.display="flex",this.recordRefreshButton.style.alignItems="center",this.recordRefreshButton.addEventListener("click",()=>{const s=H("timeline");s.recording=!0,A("timeline",s),window.location.reload()}),this.exportButton=document.createElement("button"),this.exportButton.className="console-copy-button",this.exportButton.title="Export",this.exportButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',this.exportButton.style.padding="0 10px",this.exportButton.style.lineHeight="24px",this.exportButton.style.display="flex",this.exportButton.style.alignItems="center",this.exportButton.addEventListener("click",()=>this.exportData());const i=document.createElement("div");i.className="console-buttons-group",i.appendChild(this.viewModeButton),i.appendChild(this.recordButton),i.appendChild(this.recordRefreshButton),i.appendChild(this.exportButton),i.appendChild(e),t.style.display="flex",t.style.justifyContent="space-between",t.style.padding="6px",t.style.borderBottom="1px solid var(--border-color)";const n=document.createElement("div");n.textContent="Backend Calls",n.style.display="flex",n.style.alignItems="center",n.style.color="var(--text-primary)",n.style.alignSelf="center",n.style.paddingLeft="5px",this.frameInfo=document.createElement("span"),this.frameInfo.style.display="inline-flex",this.frameInfo.style.alignItems="center",this.frameInfo.style.marginLeft="15px",this.frameInfo.style.fontFamily="monospace",this.frameInfo.style.color="var(--text-secondary)",this.frameInfo.style.fontSize="12px",n.appendChild(this.frameInfo),t.appendChild(n),t.appendChild(i),this.scrollWrapper.appendChild(t)}buildUI(){const t=document.createElement("div");t.style.display="flex",t.style.flexDirection="column",t.style.height="calc(100% - 37px)",t.style.width="100%";const e=document.createElement("div");e.style.height="60px",e.style.minHeight="60px",e.style.borderBottom="1px solid var(--border-color)",e.style.backgroundColor="var(--background-color)",this.graphSlider=document.createElement("div"),this.graphSlider.style.height="100%",this.graphSlider.style.margin="0 10px",this.graphSlider.style.position="relative",this.graphSlider.style.cursor="crosshair",e.appendChild(this.graphSlider),this.graph.domElement.style.width="100%",this.graph.domElement.style.height="100%",this.graphSlider.appendChild(this.graph.domElement),this.hoverIndicator=document.createElement("div"),this.hoverIndicator.style.position="absolute",this.hoverIndicator.style.top="0",this.hoverIndicator.style.bottom="0",this.hoverIndicator.style.width="1px",this.hoverIndicator.style.backgroundColor="rgba(255, 255, 255, 0.3)",this.hoverIndicator.style.pointerEvents="none",this.hoverIndicator.style.display="none",this.hoverIndicator.style.zIndex="9",this.hoverIndicator.style.transform="translateX(-50%)",this.graphSlider.appendChild(this.hoverIndicator),this.playhead=document.createElement("div"),this.playhead.style.position="absolute",this.playhead.style.top="0",this.playhead.style.bottom="0",this.playhead.style.width="2px",this.playhead.style.backgroundColor="var(--color-red)",this.playhead.style.boxShadow="0 0 4px rgba(255,0,0,0.5)",this.playhead.style.pointerEvents="none",this.playhead.style.display="none",this.playhead.style.zIndex="10",this.playhead.style.transform="translateX(-50%)",this.graphSlider.appendChild(this.playhead);const i=document.createElement("div");i.style.position="absolute",i.style.top="0",i.style.left="50%",i.style.transform="translate(-50%, 0)",i.style.width="0",i.style.height="0",i.style.borderLeft="6px solid transparent",i.style.borderRight="6px solid transparent",i.style.borderTop="8px solid var(--color-red)",this.playhead.appendChild(i),this.graphSlider.tabIndex=0,this.graphSlider.style.outline="none";let n=!1;const s=o=>{if(this.frames.length===0)return;const a=this.graphSlider.getBoundingClientRect();let l=o.clientX-a.left;l=Math.max(0,Math.min(l,a.width)),this.fixedScreenX=l;const d=this.graph.lines.calls.points.length;if(d===0)return;const h=a.width/(this.graph.maxPoints-1),c=a.width-(d-1)*h;let m=Math.round((l-c)/h);m=Math.max(0,Math.min(m,d-1)),m>=d-2?this.isTrackingLatest=!0:this.isTrackingLatest=!1;let u=m;this.frames.length>d&&(u+=this.frames.length-d),this.playhead.style.display="block",this.selectFrame(u)};this.graphSlider.addEventListener("mousedown",o=>{n=!0,this.isManualScrubbing=!0,this.graphSlider.focus(),s(o)}),this.graphSlider.addEventListener("mouseenter",()=>{this.frames.length>0&&!this.isRecording&&(this.hoverIndicator.style.display="block")}),this.graphSlider.addEventListener("mouseleave",()=>{this.hoverIndicator.style.display="none"}),this.graphSlider.addEventListener("mousemove",o=>{if(this.frames.length===0||this.isRecording)return;const a=this.graphSlider.getBoundingClientRect();let l=o.clientX-a.left;l=Math.max(0,Math.min(l,a.width));const d=this.graph.lines.calls.points.length;if(d>0){const h=a.width/(this.graph.maxPoints-1),c=a.width-(d-1)*h;let m=Math.round((l-c)/h);m=Math.max(0,Math.min(m,d-1));let u=c+m*h;u=Math.max(1,Math.min(u,a.width-1)),this.hoverIndicator.style.left=u+"px"}else{const h=Math.max(1,Math.min(l,a.width-1));this.hoverIndicator.style.left=h+"px"}}),this.graphSlider.addEventListener("keydown",o=>{if(this.frames.length===0||this.isRecording)return;let a=this.selectedFrameIndex;if(o.key==="ArrowLeft"?(a=Math.max(0,this.selectedFrameIndex-1),o.preventDefault()):o.key==="ArrowRight"&&(a=Math.min(this.frames.length-1,this.selectedFrameIndex+1),o.preventDefault()),a!==this.selectedFrameIndex){this.selectFrame(a);const l=this.graph.lines.calls.points.length;if(l>0){let d=a;this.frames.length>l&&(d=a-(this.frames.length-l)),d>=l-2?this.isTrackingLatest=!0:this.isTrackingLatest=!1;const h=this.graphSlider.getBoundingClientRect(),c=h.width/(this.graph.maxPoints-1),m=h.width-(l-1)*c;this.fixedScreenX=m+d*c}}}),window.addEventListener("mousemove",o=>{if(n){s(o);const a=this.graphSlider.getBoundingClientRect();let l=o.clientX-a.left;l=Math.max(0,Math.min(l,a.width));const d=this.graph.lines.calls.points.length;if(d>0){const h=a.width/(this.graph.maxPoints-1),c=a.width-(d-1)*h;let m=Math.round((l-c)/h);m=Math.max(0,Math.min(m,d-1));let u=c+m*h;u=Math.max(1,Math.min(u,a.width-1)),this.hoverIndicator.style.left=u+"px"}else{const h=Math.max(1,Math.min(l,a.width-1));this.hoverIndicator.style.left=h+"px"}}}),window.addEventListener("mouseup",()=>{n=!1,this.isManualScrubbing=!1}),t.appendChild(e);const r=document.createElement("div");r.style.flex="1",r.style.display="flex",r.style.flexDirection="column",r.style.overflow="hidden",this.timelineTrack=document.createElement("div"),this.timelineTrack.style.flex="1",this.timelineTrack.style.overflowY="auto",this.timelineTrack.style.margin="10px",this.timelineTrack.style.backgroundColor="var(--background-color)",r.appendChild(this.timelineTrack),t.appendChild(r),this.scrollWrapper.appendChild(t)}setRenderer(t){this.renderer=t;const e=H("timeline");e.recording&&(e.recording=!1,A("timeline",e),this.toggleRecording())}toggleRecording(){if(!this.renderer){console.warn("Timeline: No renderer defined.");return}this.isRecording=!this.isRecording,this.isRecording?(this.recordButton.title="Stop",this.recordButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',this.recordButton.style.color="var(--color-red)",this.startRecording()):(this.recordButton.title="Record",this.recordButton.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>',this.recordButton.style.color="",this.stopRecording(),this.renderSlider())}startRecording(){this.frames=[],this.currentFrame=null,this.selectedFrameIndex=-1,this.fixedScreenX=0,this.isTrackingLatest=!0,this.isManualScrubbing=!1,this.clear(),this.frameInfo.textContent="Recording...";const t=this.renderer.backend,e=Object.getOwnPropertyNames(Object.getPrototypeOf(t)).filter(i=>i!=="constructor");for(const i of e){const n=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t),i);if(n&&(n.get||n.set))continue;const s=t[i];typeof s=="function"&&typeof i=="string"&&(this.originalMethods.set(i,s),t[i]=(...r)=>{if(i.toLowerCase().includes("timestamp")||i.startsWith("get")||i.startsWith("set")||i.startsWith("has")||i.startsWith("_")||i.startsWith("needs"))return s.apply(t,r);const o=this.renderer.info.frame;if(!this.currentFrame||this.currentFrame.id!==o){if(this.currentFrame){this.currentFrame.fps=this.renderer.inspector?this.renderer.inspector.fps:0,isFinite(this.currentFrame.fps)||(this.currentFrame.fps=0);const d=this.currentFrame.triangles||0;if(d>this.baseTriangles){const c=this.baseTriangles;if(this.baseTriangles=d,c>0){const m=c/this.baseTriangles,u=this.graph.lines.triangles.points;for(let f=0;f<u.length;f++)u[f]*=m}}const h=this.baseTriangles>0?d/this.baseTriangles*Q:0;this.graph.addPoint("calls",this.currentFrame.calls.length),this.graph.addPoint("fps",this.currentFrame.fps),this.graph.addPoint("triangles",h),this.graph.update()}if(this.currentFrame={id:o,calls:[],fps:0,triangles:0},this.frames.push(this.currentFrame),this.frames.length>J&&this.frames.shift(),!this.isManualScrubbing){if(this.isTrackingLatest){const d=this.frames.length>1?this.frames.length-2:0;this.selectFrame(d)}else if(this.selectedFrameIndex!==-1){const d=this.graph.lines.calls.points.length;if(d>0){const h=this.graphSlider.getBoundingClientRect(),c=h.width/(this.graph.maxPoints-1),m=h.width-(d-1)*c;let u=Math.round((this.fixedScreenX-m)/c);u=Math.max(0,Math.min(u,d-1));let f=u;this.frames.length>d&&(f+=this.frames.length-d),this.selectFrame(f)}}}}const a={method:i,target:r[0]},l=this.getCallDetail(i,r);return l&&(a.details=l,l.triangles!==void 0&&(this.currentFrame.triangles+=l.triangles)),this.currentFrame.calls.push(a),s.apply(t,r)})}}stopRecording(){if(this.originalMethods.size>0){const t=this.renderer.backend;for(const[e,i]of this.originalMethods.entries())t[e]=i;this.originalMethods.clear(),this.currentFrame&&(this.currentFrame.fps=this.renderer.inspector?this.renderer.inspector.fps:0)}}clear(){this.frames=[],this.timelineTrack.innerHTML="",this.playhead.style.display="none",this.frameInfo.textContent="",this.baseTriangles=0,this.graph.lines.calls.points=[],this.graph.lines.fps.points=[],this.graph.lines.triangles.points=[],this.graph.resetLimit(),this.graph.update()}exportData(){if(this.frames.length===0)return;const t=JSON.stringify(this.frames,null,"	"),e=new Blob([t],{type:"application/json"}),i=URL.createObjectURL(e),n=document.createElement("a");n.href=i,n.download="threejs-timeline.json",n.click(),URL.revokeObjectURL(i)}getRenderTargetDetails(t){const e=t.textures,i=[],n=o=>{switch(o.type){case Nt:case Ft:return"8";case Mt:case Rt:case zt:case Bt:case It:return"16";case St:case Lt:case Tt:case Et:case Ct:case kt:return"32";default:return"?"}},s=o=>{switch(o.format){case _t:return"a";case $t:case Ut:return"r";case jt:case Ot:return"rg";case Vt:case Pt:return"rgb";case Dt:return"depth";case At:return"depth-stencil";case Ht:case Wt:default:return"rgba"}};for(let o=0;o<e.length;o++){const a=e[o],l=n(a),d=s(a);let h=`[${o}]`;a.name&&!(a.isDepthTexture&&a.name==="depth")&&(h+=` ${a.name}`),h+=` ${d} ${l} bpc`,i.push(h)}const r={target:t.name||"RenderTarget",[`attachments(${e.length})`]:i.join(", ")};return t.depthTexture&&(r.depth=`${n(t.depthTexture)} bpc`),r}getCallDetail(t,e){switch(t){case"draw":{const i=e[0],n={object:i.object.name||i.object.type,material:i.material.name||i.material.type,geometry:i.geometry.name||i.geometry.type};if(i.getDrawParameters){const s=i.getDrawParameters();s&&(i.object.isMesh||i.object.isSprite)&&(n.triangles=s.vertexCount/3,i.object.count>1&&(n.instance=i.object.count,n["triangles per instance"]=n.triangles,n.triangles*=n.instance))}return n}case"beginRender":{const i=e[0],n={scene:this.renderer.inspector.currentRender.name||"unknown",camera:i.camera.name||i.camera.type};return i.renderTarget&&!i.renderTarget.isPostProcessingRenderTarget?Object.assign(n,this.getRenderTargetDetails(i.renderTarget)):n.target="CanvasTarget",n}case"beginCompute":return{compute:this.renderer.inspector.currentCompute.name||"unknown"};case"compute":{const i=e[1],n=e[2],s=e[4]||i.dispatchSize||i.count,r=i.name||i.type||"unknown";let o=0;n&&(o=n.length);let a;return s.isIndirectStorageBufferAttribute?a="indirect":Array.isArray(s)?a=s.join(", "):a=s,{node:r,bindings:o,dispatch:a}}case"updateBinding":return{group:e[0].name||"unknown"};case"clear":{const i=e[3],n={color:e[0],depth:e[1],stencil:e[2]};if(i.renderTarget&&!i.renderTarget.isPostProcessingRenderTarget){const s=this.getRenderTargetDetails(i.renderTarget);s.depth&&(s["depth texture"]=s.depth,delete s.depth),Object.assign(n,s)}else n.target="CanvasTarget";return n}case"updateViewport":{const i=e[0],{x:n,y:s,width:r,height:o}=i.viewportValue;return{x:n,y:s,width:r,height:o}}case"updateScissor":{const i=e[0],{x:n,y:s,width:r,height:o}=i.scissorValue;return{x:n,y:s,width:r,height:o}}case"createProgram":case"destroyProgram":{const i=e[0];return{stage:i.stage,name:i.name||"unknown"}}case"createRenderPipeline":{const i=e[0];return{object:i.object&&(i.object.name||i.object.type)||"unknown",material:i.material&&(i.material.name||i.material.type)||"unknown"}}case"createComputePipeline":case"destroyComputePipeline":return{name:e[0].name||"unknown"};case"createBindings":case"updateBindings":{const i=e[0],n={group:i.name||"unknown"};return i.bindings&&(n.count=i.bindings.length),n}case"createNodeBuilder":{const i=e[0],n={object:i.name||i.type||"unknown"};return i.material&&(n.material=i.material.name||i.material.type||"unknown"),n}case"createAttribute":case"createIndexAttribute":case"createStorageAttribute":case"destroyAttribute":case"destroyIndexAttribute":case"destroyStorageAttribute":{const i=e[0],n={};return i.name&&(n.name=i.name),i.count!==void 0&&(n.count=i.count),i.itemSize!==void 0&&(n.itemSize=i.itemSize),n}case"copyFramebufferToTexture":{const i=e[0],n=e[2];return{target:this.getTextureName(i),width:n.z,height:n.w}}case"copyTextureToTexture":{const i=e[0],n=e[1];return{source:this.getTextureName(i),destination:this.getTextureName(n)}}case"updateSampler":{const i=e[0];return{magFilter:this.getTextureFilterName(i.magFilter),minFilter:this.getTextureFilterName(i.minFilter),wrapS:this.getTextureWrapName(i.wrapS),wrapT:this.getTextureWrapName(i.wrapT),anisotropy:i.anisotropy}}case"updateTexture":case"generateMipmaps":case"createTexture":case"destroyTexture":{const i=e[0],s={texture:this.getTextureName(i)};return i.image&&(i.image.width!==void 0&&(s.width=i.image.width),i.image.height!==void 0&&(s.height=i.image.height)),s}}return null}getTextureName(t){if(t.name)return t.name;const e=["isFramebufferTexture","isDepthTexture","isDataArrayTexture","isData3DTexture","isDataTexture","isCompressedArrayTexture","isCompressedTexture","isCubeTexture","isVideoTexture","isCanvasTexture","isTexture"];for(const i of e)if(t[i])return i.replace("is","");return"Texture"}getTextureFilterName(t){return{1003:"Nearest",1004:"NearestMipmapNearest",1005:"NearestMipmapLinear",1006:"Linear",1007:"LinearMipmapNearest",1008:"LinearMipmapLinear"}[t]||t}getTextureWrapName(t){return{1e3:"Repeat",1001:"ClampToEdge",1002:"MirroredRepeat"}[t]||t}formatDetails(t){const e=[];for(const i in t)t[i]!==void 0&&e.push(`<span style="opacity: 0.5">${i}:</span> <span style="color: var(--text-secondary); opacity: 1">${t[i]}</span>`);return e.length===0?"":`<span style="font-size: 11px; margin-left: 8px; color: var(--text-secondary); opacity: 1;">{ ${e.join('<span style="opacity: 0.5">, </span>')} }</span>`}renderSlider(){if(this.frames.length===0){this.playhead.style.display="none",this.frameInfo.textContent="";return}this.graph.lines.calls.points=[],this.graph.lines.fps.points=[],this.graph.lines.triangles.points=[],this.graph.resetLimit();let t=this.frames;t.length>this.graph.maxPoints&&(t=t.slice(-this.graph.maxPoints),this.frames=t);let e=0;for(let n=0;n<t.length;n++){const s=t[n].triangles||0;s>e&&(e=s)}for(let n=0;n<t.length;n++){const s=t[n].triangles||0,r=e>0?s/e*Q:0;this.graph.addPoint("calls",t[n].calls.length),this.graph.addPoint("fps",t[n].fps||0),this.graph.addPoint("triangles",r)}this.graph.update(),this.playhead.style.display="block";let i=0;this.selectedFrameIndex!==-1&&this.selectedFrameIndex<this.frames.length?i=this.selectedFrameIndex:this.frames.length>0&&(i=this.frames.length-1),this.selectFrame(i)}selectFrame(t){if(t<0||t>=this.frames.length)return;this.selectedFrameIndex=t;const e=this.frames[t];this.renderTimelineTrack(e);const i=(o,a)=>`<span style="display:inline-flex;align-items:center;margin-left:12px;"><span style="width:6px;height:6px;border-radius:50%;background-color:${o};margin-right:6px;"></span>${a}</span>`,n=Math.max(this.baseTriangles,e.triangles||0);this.frameInfo.innerHTML="Frame: "+e.id+i("var(--color-fps)",(e.fps||0).toFixed(1)+" FPS")+i("var(--color-call)",e.calls.length+" calls")+i("var(--color-red)",(e.triangles||0)+" / "+n+" triangles");const s=this.graphSlider.getBoundingClientRect(),r=this.graph.lines.calls.points.length;if(r>0){const o=s.width/(this.graph.maxPoints-1);let a=t;this.frames.length>r&&(a=t-(this.frames.length-r));let d=s.width-(r-1)*o+a*o;d=Math.max(1,Math.min(d,s.width-1)),this.playhead.style.left=d+"px",this.playhead.style.display="block"}}getCallBlock(t,e,i=0){const n=t.target;let s;if(n&&typeof n=="object"){let r=this.callBlocks.get(n);r||(r=[],this.callBlocks.set(n,r)),s=r[i]}else s=this.fallbackBlocks[e];return s||(s=document.createElement("div"),s.style.padding="4px 8px",s.style.margin="2px 0",s.style.backgroundColor="rgba(255, 255, 255, 0.03)",s.style.fontFamily="monospace",s.style.fontSize="12px",s.style.color="var(--text-primary)",s.style.whiteSpace="nowrap",s.style.overflow="hidden",s.style.textOverflow="ellipsis",s.style.display="flex",s.style.alignItems="center",s.arrow=document.createElement("span"),s.arrow.style.fontSize="10px",s.arrow.style.marginRight="10px",s.arrow.style.cursor="pointer",s.arrow.style.width="26px",s.arrow.style.textAlign="center",s.appendChild(s.arrow),s.titleSpan=document.createElement("span"),s.appendChild(s.titleSpan),s.addEventListener("click",r=>{s._groupId&&(r.stopPropagation(),this.collapsedGroups.has(s._groupId)?this.collapsedGroups.delete(s._groupId):this.collapsedGroups.add(s._groupId),this.renderTimelineTrack(this.frames[this.selectedFrameIndex]))}),n&&typeof n=="object"?this.callBlocks.get(n)[i]=s:this.fallbackBlocks[e]=s),s.style.cursor="default",s._groupId=null,s.arrow.style.display="none",s}renderTimelineTrack(t){if(!t||t.calls.length===0){this.timelineTrack.innerHTML="";return}this.collapsedGroups||(this.collapsedGroups=new Set);let e=0;const i=this.timelineTrack.children;let n=0;const s=new WeakMap;if(this.isHierarchicalView){const r=[];let o=null;for(let h=0;h<t.calls.length;h++){const c=t.calls[h],m=c.method.startsWith("begin")||c.method.startsWith("finish"),u=c.details?this.formatDetails(c.details):"";o&&o.method===c.method&&o.formatedDetails===u&&!m?o.count++:(o={method:c.method,count:1,formatedDetails:u,target:c.target},r.push(o))}let a=0;const l=24,d=[{element:this.timelineTrack,isCollapsed:!1,id:"",beginCount:0}];for(let h=0;h<r.length;h++){const c=r[h];let m=0;c.target&&typeof c.target=="object"&&(m=s.get(c.target)||0,s.set(c.target,m+1));const u=this.getCallBlock(c,e++,m);u.style.marginLeft=a*l+"px",u.style.borderLeft="4px solid "+this.getColorForMethod(c.method);const f=d[d.length-1];if(f.isCollapsed||(i[n]!==u&&this.timelineTrack.insertBefore(u,i[n]),n++),c.method.startsWith("begin")){const w=f.beginCount++,y=f.id+"/"+c.method+"-"+w,v=this.collapsedGroups.has(y);u._groupId=y,u.style.cursor="pointer",u.arrow.style.display="inline-block",u.arrow.textContent=v?"[ + ]":"[ - ]",u.titleSpan.innerHTML=c.method+(c.formatedDetails?c.formatedDetails:"")+(c.count>1?` <span style="opacity: 0.5">( ${c.count} )</span>`:""),a++,d.push({element:u,isCollapsed:f.isCollapsed||v,id:y,beginCount:0})}else c.method.startsWith("finish")?(u.titleSpan.innerHTML=c.method+(c.formatedDetails?c.formatedDetails:"")+(c.count>1?` <span style="opacity: 0.5">( ${c.count} )</span>`:""),a=Math.max(0,a-1),d.pop()):u.titleSpan.innerHTML=c.method+(c.formatedDetails?c.formatedDetails:"")+(c.count>1?` <span style="opacity: 0.5">( ${c.count} )</span>`:"")}}else{const r={};for(let a=0;a<t.calls.length;a++){const l=t.calls[a].method;l.startsWith("finish")||(r[l]=(r[l]||0)+1)}const o=Object.keys(r).map(a=>({method:a,count:r[a]}));o.sort((a,l)=>l.count-a.count);for(let a=0;a<o.length;a++){const l=o[a],d=this.getCallBlock(l,e++);d.style.marginLeft="0px",d.style.borderLeft="4px solid "+this.getColorForMethod(l.method),d.titleSpan.innerHTML=l.method+(l.count>1?` <span style="opacity: 0.5">( ${l.count} )</span>`:""),i[n]!==d&&this.timelineTrack.insertBefore(d,i[n]),n++}}for(;this.timelineTrack.children.length>n;)this.timelineTrack.removeChild(this.timelineTrack.lastChild)}getColorForMethod(t){return t.startsWith("begin")?"var(--color-green)":t.startsWith("finish")||t.startsWith("destroy")?"var(--color-red)":t.startsWith("draw")||t.startsWith("compute")||t.startsWith("create")||t.startsWith("generate")?"var(--color-yellow)":"var(--text-secondary)"}}class ge extends Zt{constructor(){super();const t=new Qt(this);t.addEventListener("resize",l=>this.dispatchEvent(l));const e=new nt({builtin:!0,icon:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 6l8 0" /><path d="M16 6l4 0" /><path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 12l2 0" /><path d="M10 12l10 0" /><path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 18l11 0" /><path d="M19 18l1 0" /></svg>'});e.hide(),t.addTab(e);const i=new pe;i.hide(),t.addTab(i);const n=new ee;t.addTab(n);const s=new ie;t.addTab(s);const r=new me;t.addTab(r);const o=new ne;t.addTab(o);const a=new ce;t.addTab(a),t.loadLayout(),t.activeTabId||t.setActiveTab(n.id),this.statsData=new Map,this.profiler=t,this.performance=n,this.memory=s,this.console=o,this.parameters=e,this.viewer=i,this.timeline=r,this.settings=a,this.once={},this.extensionsData=new WeakMap,this.displayCycle={text:{needsUpdate:!1,duration:.25,time:0},graph:{needsUpdate:!1,duration:.02,time:0}}}get domElement(){return this.profiler.domElement}onExtension(t,e){const i=n=>{n.name===t&&(e(n.tab),this.settings.removeEventListener("extensionadded",i))};return this.settings.extensions[t]&&this.settings.extensions[t].loaded?e(this.settings.extensions[t]):this.settings.addEventListener("extensionadded",i),this}hide(){this.profiler.hide()}show(){this.profiler.show()}getSize(){return this.profiler.getSize()}setActiveTab(t){return this.profiler.setActiveTab(t.id),this}addTab(t){return this.profiler.addTab(t),this}removeTab(t){return this.profiler.removeTab(t),this}setActiveExtension(t,e){return this.settings.setActiveExtension(t,e),this}resolveConsoleOnce(t,e){const i=t+e;this.once[i]!==!0&&(this.resolveConsole(t,e),this.once[i]=!0)}resolveConsole(t,e,i=null){switch(t){case"log":this.console.addMessage("info",e),console.log(e);break;case"warn":this.console.addMessage("warn",e),i&&i.isStackTrace?console.warn(i.getError(e)):console.warn(e);break;case"error":this.console.addMessage("error",e),i&&i.isStackTrace?console.error(i.getError(e)):console.error(e);break}}init(){const t=this.getRenderer();let e=`THREE.WebGPURenderer: ${Gt} [ "`;t.backend.isWebGPUBackend?e+="WebGPU":t.backend.isWebGLBackend&&(e+="WebGL2"),e+='" ]',this.console.addMessage("info",e),t.inspector.domElement.parentElement===null&&t.domElement.parentElement!==null&&t.domElement.parentElement.appendChild(t.inspector.domElement)}setRenderer(t){return super.setRenderer(t),t!==null&&(Xt(this.resolveConsole.bind(this)),this.isAvailable&&(t.init().then(()=>{t.backend.trackTimestamp=!0,t.hasFeature("timestamp-query")!==!0&&this.console.addMessage("error","THREE.Inspector: GPU Timestamp Queries not available.")}),this.timeline.setRenderer(t))),this}createParameters(t){return this.parameters.isVisible===!1&&this.parameters.show(),this.parameters.createGroup(t)}getStatsData(t){let e=this.statsData.get(t);return e===void 0&&(e={},this.statsData.set(t,e)),e}resolveStats(t){const e=this.getStatsData(t.cid);e.initialized!==!0&&(e.cpu=t.cpu,e.gpu=t.gpu,e.stats=[],e.initialized=!0),e.stats.length>this.maxFrames&&e.stats.shift(),e.stats.push(t),e.cpu=this.getAverageDeltaTime(e,"cpu"),e.gpu=this.getAverageDeltaTime(e,"gpu"),e.total=e.cpu+e.gpu;for(const i of t.children){this.resolveStats(i);const n=this.getStatsData(i.cid);e.cpu+=n.cpu,e.gpu+=n.gpu,e.total+=n.total}}getNodes(){return this.currentNodes}getAverageDeltaTime(t,e,i=this.fps){const n=t.stats;let s=0,r=0;for(let o=n.length-1;o>=0&&r<i;o--){const l=n[o][e];l>0&&(s+=l,r++)}return r>0?s/r:0}updateTabs(){const t=Object.values(this.profiler.tabs);for(const e of t){let i=this.extensionsData.get(e);i===void 0&&(e.init(this),i={},this.extensionsData.set(e,i)),e.update(this)}}resolveFrame(t){const e=this.getFrameById(t.frameId+1);if(e){t.cpu=0,t.gpu=0,t.total=0;for(const i of t.children){this.resolveStats(i);const n=this.getStatsData(i.cid);t.cpu+=n.cpu,t.gpu+=n.gpu,t.total+=n.total}t.deltaTime=e.startTime-t.startTime,t.miscellaneous=t.deltaTime-t.total,t.miscellaneous<0&&(t.miscellaneous=0),this.updateCycle(this.displayCycle.text),this.updateCycle(this.displayCycle.graph),this.displayCycle.text.needsUpdate&&(b("fps-counter",this.fps.toFixed()),this.performance.updateText(this,t),this.memory.updateText(this)),this.displayCycle.graph.needsUpdate&&(this.performance.updateGraph(this,t),this.memory.updateGraph(this)),this.displayCycle.text.needsUpdate=!1,this.displayCycle.graph.needsUpdate=!1}}updateCycle(t){t.time+=this.nodeFrame.deltaTime,t.time>=t.duration&&(t.needsUpdate=!0,t.time=0)}static getItem(t){return console.warn("Inspector.getItem is deprecated. Use getItem directly instead."),H(t)}static setItem(t,e){console.warn("Inspector.setItem is deprecated. Use setItem directly instead."),A(t,e)}}function H(p){return JSON.parse(localStorage.getItem("threejs-inspector")||"{}")[p]||{}}function A(p,t){const e=JSON.parse(localStorage.getItem("threejs-inspector")||"{}");t===null?delete e[p]:e[p]=t,localStorage.setItem("threejs-inspector",JSON.stringify(e))}export{ge as Inspector,H as getItem,A as setItem};
