/* ==========================================
   PHOTO VIEWER CONTROLS
========================================== */

.viewer-controls {

    position:relative;

    width:100%;

    height:0;

    z-index:20;

    pointer-events:none;

}

/* ==========================================
   POSITION
========================================== */

.viewer-controls__position {

    position:absolute;

    top:-30px;

    left:0;

    width:100%;

    text-align:center;

    font-size:14px;

    line-height:1.3;

    color:#d8dadd;

    white-space:nowrap;

    pointer-events:none;

}

/* ==========================================
   NAVIGATION BUTTONS
========================================== */

.viewer-controls__previous,
.viewer-controls__next {

    position:fixed;

    top:50%;

    width:40px;

    height:56px;

    display:flex;

    align-items:center;

    justify-content:center;

    padding:0;

    transform:translateY(-50%);

    background:#24282d;

    border:none;

    border-radius:6px;

    color:#d8dadd;

    font-size:28px;

    line-height:1;

    cursor:pointer;

    pointer-events:auto;

    z-index:1002;

    transition:

        background .15s ease,

        color .15s ease,

        opacity .15s ease;

}

.viewer-controls__previous:hover,
.viewer-controls__next:hover {

    background:#30343a;

    color:#eef0f2;

}

.viewer-controls__previous:disabled,
.viewer-controls__next:disabled {

    opacity:.25;

    cursor:default;

}

/* ==========================================
   BUTTON POSITION
========================================== */

.viewer-controls__previous {

    left:calc(50% - 470px);

}

.viewer-controls__next {

    right:calc(50% - 470px);

}
