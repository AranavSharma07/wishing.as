/* WishingASR v54 — articulated 3D character enhancement.
   Lightweight procedural rigs; original images remain the no-WebGL/offline fallback. */
(async () => {
  const stage = document.getElementById('heroIllustration');
  if (!stage || !('WebGLRenderingContext' in window)) return;
  let renderer, raf = 0, observer, resizeObserver, mutationObserver;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
    renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = 'wishingasr-3d-canvas';
    renderer.domElement.setAttribute('aria-hidden','true');
    renderer.domElement.style.pointerEvents = 'none';
    stage.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3.8,3.8,3.8,-3.8,.1,50);
    camera.position.set(0,0,18);
    scene.add(new THREE.HemisphereLight(0xeaf2ff,0x443044,2.0));
    const key = new THREE.DirectionalLight(0xffe1c1,3.0); key.position.set(-4,7,9); scene.add(key);
    const rim = new THREE.DirectionalLight(0x91aaff,1.8); rim.position.set(5,2,-4); scene.add(rim);

    const mat=(color,roughness=.58,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
    const skin=mat('#f2bd98'), hair=mat('#38251f'), pink=mat('#f17cae'), blue=mat('#315d9b'), white=mat('#fff4eb'), dark=mat('#182033'), gold=mat('#ffc95e',.3,.45), red=mat('#d9414b');
    const mouthMat=mat('#9e4651');
    const sphere=new THREE.SphereGeometry(1,24,18);
    const limbGeo=new THREE.CapsuleGeometry(.105,.48,5,12);
    const ball=(parent,m,s,p)=>{const o=new THREE.Mesh(sphere,m);o.scale.set(...s);o.position.set(...p);parent.add(o);return o;};
    const capsule=(parent,m,scale=[1,1,1])=>{const o=new THREE.Mesh(limbGeo,m);o.scale.set(...scale);parent.add(o);return o;};
    const joint=(parent,pos)=>{const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;};
    function makeEye(parent,x,y){
      const sclera=ball(parent,white,[.095,.13,.055],[x,y,.47]);
      const iris=ball(parent,dark,[.045,.075,.035],[x+.012,y-.005,.52]);
      const highlight=ball(parent,white,[.018,.025,.015],[x+.025,y+.025,.55]);
      return {sclera,iris,highlight,baseY:.13};
    }
    function makeCharacter(isGirl,x){
      const root=new THREE.Group(); root.position.x=x; scene.add(root);
      const rig=joint(root,[0,0,0]), hips=joint(rig,[0,-.45,0]);
      ball(hips,dark,[.37,.22,.22],[0,0,0]);
      const torso=joint(hips,[0,.35,0]);
      ball(torso,isGirl?pink:blue,[.39,.53,.25],[0,0,0]);
      ball(torso,white,[.22,.31,.03],[0,-.02,.245]);
      // Small collar detail gives the torso a finished, less toy-block appearance.
      ball(torso,gold,[.09,.045,.025],[0,.22,.27]);
      const neck=joint(torso,[0,.52,0]); ball(neck,skin,[.13,.15,.13],[0,0,0]);
      const head=joint(neck,[0,.34,0]);
      ball(head,skin,[.42,.48,.37],[0,0,0]);
      ball(head,hair,[.44,.22,.39],[0,.29,-.015]);
      ball(head,hair,[.12,.3,.18],[-.34,-.04,-.01]); ball(head,hair,[.12,.3,.18],[.34,-.03,-.01]);
      const eyes=[makeEye(head,-.15,.04),makeEye(head,.15,.04)];
      const browMat=mat('#4a3029');
      const brows=[ball(head,browMat,[.12,.025,.035],[-.15,.2,.35]),ball(head,browMat,[.12,.025,.035],[.15,.2,.35])];
      const mouth=ball(head,mouthMat,[.085,.035,.025],[0,-.17,.365]);
      // Arms: shoulder, elbow, wrist and palm each have their own pivot.
      const arms=[];
      for(const side of [-1,1]){
        const shoulder=joint(torso,[side*.37,.32,0]);
        capsule(shoulder,isGirl?pink:blue,[.82,1,1]); shoulder.rotation.z=side===-1?-.45:.45;
        const elbow=joint(shoulder,[side*.02,-.43,0]);
        capsule(elbow,skin,[.72,.9,.82]); elbow.rotation.z=side===-1?.15:-.15;
        const hand=joint(elbow,[0,-.42,.02]);
        ball(hand,skin,[.14,.13,.12],[0,-.02,.02]);
        arms.push({shoulder,elbow,hand,side,baseShoulder:side===-1?-.35:.35});
      }
      const legs=[];
      for(const side of [-1,1]){
        const thigh=joint(hips,[side*.18,-.12,0]); capsule(thigh,isGirl?pink:dark,[.95,1.25,1]);
        const knee=joint(thigh,[0,-.48,0]); capsule(knee,dark,[.78,.95,.85]);
        const foot=joint(knee,[0,-.48,.09]); ball(foot,white,[.2,.12,.34],[0,-.02,.13]);
        legs.push({thigh,knee,foot,side});
      }
      const props=[];
      arms.forEach(({hand,side})=>{const prop=new THREE.Group();prop.position.set(0,-.02,.2);hand.add(prop);props.push({prop,side});});
      return {root,rig,hips,torso,head,eyes,brows,mouth,arms,legs,props,isGirl,phase:isGirl?1.8:0,waveUntil:0,reactUntil:0};
    }
    const characters=[makeCharacter(false,-1.65),makeCharacter(true,1.65)];
    function propFor(group,kind){
      while(group.children.length) group.remove(group.children[0]);
      if(kind==='diwali'){
        const diya=new THREE.Group(); group.add(diya);
        const bowl=new THREE.Mesh(new THREE.SphereGeometry(.18,16,10,0,Math.PI*2,0,Math.PI/2),gold);bowl.scale.y=.45;diya.add(bowl);
        const flame=ball(diya,mat('#ff8b32',.25),[.07,.16,.07],[0,.12,.02]);flame.material.emissive=new THREE.Color('#ff6b16');flame.material.emissiveIntensity=1.3;
      } else if(kind==='christmas'){
        ball(group,red,[.14,.16,.13],[0,0,0]);ball(group,gold,[.06,.06,.06],[.12,.1,.03]);
      } else if(kind==='holi'){
        ball(group,mat('#ff4fa0'),[.16,.16,.16],[0,0,0]);ball(group,mat('#43c8e8'),[.07,.07,.07],[.1,.1,.04]);
      } else if(kind==='birthday'||kind==='newyear'){
        ball(group,red,[.16,.17,.13],[0,0,0]);ball(group,gold,[.035,.2,.15],[0,0,.02]);
      } else if(kind==='eid'||kind==='wedding'){
        group.add(new THREE.Mesh(new THREE.OctahedronGeometry(.17),gold));
      } else if(kind==='rakhi'){
        ball(group,gold,[.13,.13,.08],[0,0,0]);
      } else {
        ball(group,gold,[.12,.12,.12],[0,0,0]);
      }
    }
    const aliases={deepavali:'diwali',christmasday:'christmas',new_year:'newyear','new-year':'newyear',rakshabandhan:'rakhi',raksha_bandhan:'rakhi',anniversary:'wedding',valentine:'wedding',eidulfitr:'eid'};
    let occasion='';
    function detectOccasion(){
      const id=(stage.dataset.occasion||'').toLowerCase();
      const txt=((document.getElementById('heroEyebrow')?.textContent||'')+' '+(document.getElementById('heroTitle')?.textContent||'')+' '+(document.getElementById('heroDescription')?.textContent||'')).toLowerCase();
      let next=aliases[id]||id;
      if(!['diwali','christmas','holi','birthday','newyear','eid','wedding','rakhi'].includes(next)){
        next='default';
        if(/diwali|deepavali|diyas/.test(txt))next='diwali';
        else if(/christmas|santa|snow|winter/.test(txt))next='christmas';
        else if(/holi|colour|color/.test(txt))next='holi';
        else if(/birthday|cake/.test(txt))next='birthday';
        else if(/new year|countdown/.test(txt))next='newyear';
        else if(/\beid\b|ramadan/.test(txt))next='eid';
        else if(/wedding|anniversary|valentine/.test(txt))next='wedding';
        else if(/rakhi|raksha bandhan/.test(txt))next='rakhi';
      }
      if(next!==occasion){occasion=next;characters.forEach(c=>c.props.forEach(p=>propFor(p.prop,occasion)));}
    }
    detectOccasion();
    mutationObserver=new MutationObserver(detectOccasion);
    ['heroEyebrow','heroTitle','heroDescription'].forEach(id=>{const el=document.getElementById(id);if(el)mutationObserver.observe(el,{childList:true,subtree:true,characterData:true});});
    mutationObserver.observe(stage,{attributes:true,attributeFilter:['data-occasion']});

    // Keep the existing invisible-but-focusable character buttons as accessible hit targets.
    stage.querySelectorAll('.hero-character').forEach((button,index)=>{
      button.addEventListener('click',()=>{const c=characters[index];if(!c)return;c.waveUntil=performance.now()+1500;c.reactUntil=performance.now()+1700;});
    });
    stage.addEventListener('pointerdown',()=>{characters.forEach(c=>c.reactUntil=performance.now()+900);},{passive:true});

    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse=window.matchMedia('(pointer: coarse)').matches;
    let active=true,last=0;
    function animate(t){
      raf=requestAnimationFrame(animate);
      if(!active||document.hidden)return;
      const interval=reduced?500:(coarse?40:30);
      if(t-last<interval)return;last=t;
      const time=t*.001;
      characters.forEach((c)=>{
        const w=Math.sin(time*1.25+c.phase),bob=Math.sin(time*1.8+c.phase);
        const reacting=t<c.reactUntil, waving=t<c.waveUntil;
        c.rig.position.y=.06+bob*.055+(reacting?Math.abs(Math.sin(time*5+c.phase))*.06:0);
        c.rig.rotation.z=w*.025+(reacting?Math.sin(time*5+c.phase)*.025:0);
        c.head.rotation.y=Math.sin(time*.7+c.phase)*.1;
        c.head.rotation.z=Math.sin(time*.9+c.phase)*.025;
        c.torso.rotation.z=Math.sin(time*1.2+c.phase)*.02;
        // Natural eye tracking and short blinks, with a brighter expression on interaction.
        const blink=(Math.sin(time*.63+c.phase*2)>0.994)?0.08:1;
        c.eyes.forEach((eye,j)=>{eye.sclera.scale.y=eye.baseY*blink;eye.iris.position.x=(j===0?-.15:.15)+Math.sin(time*.45+c.phase)*.012;eye.highlight.position.x=eye.iris.position.x+.013;});
        c.brows.forEach((b,j)=>{b.rotation.z=(j===0?-1:1)*(reacting?.08:.015)*Math.sin(time*2+c.phase);});
        c.mouth.scale.y=reacting?.075:.035;
        c.arms.forEach((a,j)=>{
          const raise=waving&&a.side===1;
          a.shoulder.rotation.z=a.baseShoulder+Math.sin(time*1.5+c.phase+j)*.11+(raise?-.95:0);
          a.elbow.rotation.z=(a.side<0?-.1:.1)+Math.sin(time*1.3+c.phase+j)*.1+(raise?Math.sin(time*9)*.18:0);
          a.hand.rotation.z=Math.sin(time*1.8+c.phase+j)*.1+(raise?Math.sin(time*9)*.12:0);
        });
        c.legs.forEach((l,j)=>{l.thigh.rotation.z=Math.sin(time*1.3+c.phase+j)*.055;l.knee.rotation.z=Math.max(0,Math.sin(time*1.3+c.phase+j))*.06;});
        c.props.forEach((p,j)=>{p.prop.rotation.z=Math.sin(time*1.8+c.phase+j)*.07;});
      });
      renderer.render(scene,camera);
    }
    function resize(){
      const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
      renderer.setSize(w,h,false);
      const aspect=w/h,viewH=4.3;camera.left=-viewH*aspect/2;camera.right=viewH*aspect/2;camera.top=viewH/2;camera.bottom=-viewH/2;camera.updateProjectionMatrix();
    }
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();
    observer=new IntersectionObserver(entries=>{active=entries.some(e=>e.isIntersecting);},{rootMargin:'120px'});observer.observe(stage);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.remove('rigged-3d-active');renderer.domElement.remove();},{once:true});
    stage.classList.add('rigged-3d-active');
    animate(0);
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);observer?.disconnect();resizeObserver?.disconnect();mutationObserver?.disconnect();renderer?.dispose();},{once:true});
  } catch(err) {
    stage.classList.remove('rigged-3d-active');
    renderer?.domElement?.remove();
    console.warn('WishingASR 3D characters unavailable; using original character artwork.',err);
  }
})();