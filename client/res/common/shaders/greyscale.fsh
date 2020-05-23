#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

uniform vec3 u_color;

void main ()
{
	vec4 sample = texture2D(CC_Texture0, v_texCoord);
	gl_FragColor.rgb = vec3(u_color.r * sample.r + u_color.g * sample.g + u_color.b * sample.b);
	gl_FragColor.a = sample.a * v_fragmentColor.a;
}